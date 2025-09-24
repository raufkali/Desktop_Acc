const Person = require("../models/Person");
const Transaction = require("../models/Trx");
const Account = require("../models/Account");

// ─── Get Summary ───────────────────────────────
const getSummary = async (userId) => {
  try {
    if (!userId) throw new Error("userId is required");

    // Find all transactions for the user
    const transactions = await Transaction.find({ userId });
    if (!transactions || transactions.length === 0) {
      return {
        totalSend: 0,
        totalReceive: 0,
        netBalance: 0,
        totalDebitors: 0,
        totalCreditors: 0,
      };
    }
    // Calculate totals
    const totalSend = transactions
      .filter((trx) => trx.trxType === "send")
      .reduce((sum, trx) => sum + (trx.amount || 0), 0);
    const totalReceive = transactions
      .filter((trx) => trx.trxType === "receive")
      .reduce((sum, trx) => sum + (trx.amount || 0), 0);
    const netBalance = totalReceive - totalSend;
    const totalSendQuantity = transactions
      .filter((trx) => trx.trxType === "send")
      .reduce((sum, trx) => sum + (trx.quantity || 0), 0);
    const totalReceiveQuantity = transactions
      .filter((trx) => trx.trxType === "receive")
      .reduce((sum, trx) => sum + (trx.quantity || 0), 0);
    const netQuantity = totalReceiveQuantity - totalSendQuantity;
    // Fetch Person to get debitors and creditors
    const person = await Person.findOne({ userId });
    const totalDebitors =
      person?.debitors?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const totalCreditors =
      person?.creditors?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
    // Fetch All send and Receive transactions for the user
    const SendTrx = await Transaction.find({ userId, trxType: "send" }).sort({
      createdAt: 1,
    });
    const ReceiveTrx = await Transaction.find({
      userId,
      trxType: "receive",
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
    return { error: error.message };
  }
};
module.exports = { getSummary };
