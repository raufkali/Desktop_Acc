// controllers/summaryController.js
const Person = require("../models/Person");
const Transaction = require("../models/Trx");

/**
 * Create start/end Date for a period
 * period: 'day' | 'month' | 'year'
 * dateStr:
 *   - day: 'YYYY-MM-DD'
 *   - month: 'YYYY-MM' OR provide year & month separately
 *   - year: 'YYYY'
 */
const getRangeForPeriod = (period, dateStr, extra = {}) => {
  // return { start: Date, end: Date }
  if (!period) throw new Error("period is required");

  if (period === "day") {
    // dateStr: 'YYYY-MM-DD'
    const start = new Date(dateStr + "T00:00:00.000Z");
    const end = new Date(dateStr + "T23:59:59.999Z");
    return { start, end };
  }

  if (period === "month") {
    // allow dateStr like 'YYYY-MM' OR extra.year & extra.month (1-12)
    let year, month; // month 0-based for Date
    if (dateStr && /^\d{4}-\d{2}$/.test(dateStr)) {
      year = parseInt(dateStr.split("-")[0], 10);
      month = parseInt(dateStr.split("-")[1], 10) - 1;
    } else if (extra.year && extra.month) {
      year = parseInt(extra.year, 10);
      month = parseInt(extra.month, 10) - 1;
    } else {
      throw new Error("month requires YYYY-MM or year+month");
    }
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)); // last day of month
    return { start, end };
  }

  if (period === "year") {
    // dateStr: 'YYYY' or extra.year
    const year = dateStr ? parseInt(dateStr, 10) : parseInt(extra.year, 10);
    if (!year || isNaN(year)) throw new Error("year required for period=year");
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return { start, end };
  }

  throw new Error("unsupported period");
};

const safeNumber = (n) => (typeof n === "number" && !isNaN(n) ? n : 0);

const sumArrayByField = (arr = [], field = "amount", range = null) => {
  // If range provided, try to filter arr items by date field 'date' or 'createdAt'
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((acc, item) => {
    if (range) {
      const d = item.date || item.createdAt;
      if (d) {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return acc;
        if (dt < range.start || dt > range.end) return acc;
      } else {
        // if no date on item, skip it for period-specific sums
        return acc;
      }
    }
    return acc + safeNumber(item[field]);
  }, 0);
};

// Main function used by route
const getSummary = async (
  userId,
  period = "day",
  dateStr = null,
  extra = {}
) => {
  try {
    if (!userId) throw new Error("userId is required");

    // determine range
    let range = null;
    if (period) {
      range = getRangeForPeriod(period, dateStr, extra);
    }

    // Build transaction query
    const trxQuery = { userId };
    if (range) {
      trxQuery.createdAt = { $gte: range.start, $lte: range.end };
    }

    const transactions = await Transaction.find(trxQuery);

    if (!transactions || transactions.length === 0) {
      // Still compute person debitors/creditors filtered by range if possible
      const person = await Person.findOne({ userId });
      const totalDebitors = sumArrayByField(person?.debitors, "amount", range);
      const totalCreditors = sumArrayByField(
        person?.creditors,
        "amount",
        range
      );
      return {
        totalSend: 0,
        totalReceive: 0,
        netBalance: 0,
        totalSendQuantity: 0,
        totalReceiveQuantity: 0,
        netQuantity: 0,
        totalDebitors,
        totalCreditors,
        SendTrx: [],
        ReceiveTrx: [],
      };
    }

    const totalSend = transactions
      .filter((trx) => trx.trxType === "send")
      .reduce((sum, trx) => sum + safeNumber(trx.amount), 0);

    const totalReceive = transactions
      .filter((trx) => trx.trxType === "receive")
      .reduce((sum, trx) => sum + safeNumber(trx.amount), 0);

    const totalSendQuantity = transactions
      .filter((trx) => trx.trxType === "send")
      .reduce((sum, trx) => sum + safeNumber(trx.quantity), 0);

    const totalReceiveQuantity = transactions
      .filter((trx) => trx.trxType === "receive")
      .reduce((sum, trx) => sum + safeNumber(trx.quantity), 0);

    const netBalance = totalReceive - totalSend;
    const netQuantity = totalReceiveQuantity - totalSendQuantity;

    // Person debitors/creditors sum (try to filter by range)
    const person = await Person.findOne({ userId });
    const totalDebitors = sumArrayByField(person?.debitors, "amount", range);
    const totalCreditors = sumArrayByField(person?.creditors, "amount", range);

    // Fetch send/receive transactions lists ordered (limit optional)
    const SendTrx = await Transaction.find({
      userId,
      trxType: "send",
      ...(range ? { createdAt: { $gte: range.start, $lte: range.end } } : {}),
    }).sort({ createdAt: 1 });

    const ReceiveTrx = await Transaction.find({
      userId,
      trxType: "receive",
      ...(range ? { createdAt: { $gte: range.start, $lte: range.end } } : {}),
    }).sort({ createdAt: -1 });

    return {
      totalSendQuantity,
      totalReceiveQuantity,
      totalSend,
      totalReceive,
      netBalance,
      totalDebitors,
      totalCreditors,
      SendTrx,
      ReceiveTrx,
      netQuantity,
    };
  } catch (error) {
    return { error: error.message || error.toString() };
  }
};

module.exports = { getSummary };
