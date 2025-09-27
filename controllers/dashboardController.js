const Partner = require("../models/Partner");
const Trx = require("../models/Trx");
const Person = require("../models/Person");
const Account = require("../models/Account");

const getDashboard = async (userId) => {
  try {
    // Counts filtered by userId
    const partnersCount = await Partner.countDocuments({ userId });
    const trxsCount = await Trx.countDocuments({ userId });
    const personsCount = await Person.countDocuments({ userId });
    const accountsCount = await Account.countDocuments({ userId });

    // Get all transactions once (instead of aggregation)
    const allTrxs = await Trx.find({ userId });

    // Totals
    const totSent = allTrxs
      .filter((t) => t.trxType === "send")
      .reduce((sum, t) => sum + t.amount, 0);

    const totReceived = allTrxs
      .filter((t) => t.trxType === "receive")
      .reduce((sum, t) => sum + t.amount, 0);

    // Partner Accounts (calculate manually)
    const allPartners = await Partner.find({ userId });

    const partnerAcc = allPartners.map((partner) => {
      const totalSentAmnt = allTrxs
        .filter((t) => t.trxType === "send" && t.onBehalfOf === partner.name)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalReceivedAmnt = allTrxs
        .filter((t) => t.trxType === "receive" && t.sender === partner.name)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalSentQnt = allTrxs
        .filter((t) => t.trxType === "send" && t.onBehalfOf === partner.name)
        .reduce((sum, t) => sum + t.quantity, 0);

      const totalReceivedQnt = allTrxs
        .filter((t) => t.trxType === "receive" && t.sender === partner.name)
        .reduce((sum, t) => sum + t.quantity, 0);

      return {
        name: partner.name,
        totalSentAmnt,
        totalReceivedAmnt,
        totalReceivedQnt,
        totalSentQnt,
        remainQnt: totalReceivedQnt - totalSentQnt,
        profit: totalReceivedAmnt - totalSentAmnt,
      };
    });

    return {
      totSent,
      totReceived,
      partnersCount,
      trxsCount,
      personsCount,
      accountsCount,
      partnerAcc,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

module.exports = { getDashboard };
