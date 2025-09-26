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

    // Totals
    const totSent = await Trx.aggregate([
      { $match: { userId, trxType: "send" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totReceived = await Trx.aggregate([
      { $match: { userId, trxType: "receive" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Partner Accounts using aggregation (faster than looping)
    const partnerStats = await Trx.aggregate([
      { $match: { userId } },
      {
        $facet: {
          sent: [
            { $match: { trxType: "send" } },
            { $group: { _id: "$sender", totalSent: { $sum: "$amount" } } },
          ],
          received: [
            { $match: { trxType: "receive" } },
            {
              $group: { _id: "$receiver", totalReceived: { $sum: "$amount" } },
            },
          ],
        },
      },
      {
        $project: {
          merged: {
            $setUnion: ["$sent", "$received"],
          },
          sent: 1,
          received: 1,
        },
      },
    ]);

    const sentMap = new Map(
      partnerStats[0].sent.map((s) => [s._id, s.totalSent])
    );
    const recvMap = new Map(
      partnerStats[0].received.map((r) => [r._id, r.totalReceived])
    );

    const allPartners = await Partner.find({ userId });
    const partnerAcc = allPartners.map((partner) => {
      const totalSent = sentMap.get(partner.name) || 0;
      const totalReceived = recvMap.get(partner.name) || 0;
      return {
        name: partner.name,
        totalSent,
        totalReceived,
        profit: totalReceived - totalSent,
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
