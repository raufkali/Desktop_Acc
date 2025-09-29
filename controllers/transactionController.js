const Transaction = require("../models/Trx");
const User = require("../models/User");
const Account = require("../models/Account");
const Person = require("../models/Person");
const Partner = require("../models/Partner");

// ─── Create Transaction ───────────────────────────────
const createTransaction = async (data) => {
  try {
    const {
      trxType,
      sender,
      receiver,
      amount,
      rate,
      quantity,
      userId,
      fromAccount,
      createdAt,
      onBehalfOf,
      note,
    } = data;

    if (!trxType || !userId) {
      throw new Error("Transaction type and userId are required!");
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) throw new Error("User not found!");

    const account = await Account.findOne({ name: fromAccount, userId });
    if (!account)
      throw new Error("Account not Found!, please create one first");

    let person = await Person.findOne({ userId });
    if (!person) {
      person = await Person.create({
        userId,
        transactions: { sendTrx: [], receiveTrx: [] },
        debitors: [],
        creditors: [],
      });
    }

    let finalSender, finalReceiver;
    if (trxType === "send") {
      finalSender = currentUser.username || currentUser.name || "Me";
      finalReceiver = receiver;
      account.balance -= parseFloat(amount);
      account.quantity -= parseFloat(quantity);

      if (onBehalfOf) {
        const partner = await Partner.findOne({ name: onBehalfOf, userId });
        if (!partner) throw new Error("Partner doesn't exist");
        partner.Balance += parseFloat(amount);
        partner.Quantity += parseFloat(quantity);
        await partner.save();
      }
    } else if (trxType === "receive") {
      finalSender = sender;
      finalReceiver = currentUser.username || currentUser.name || "Me";
      account.balance += parseFloat(amount);
      account.quantity += parseFloat(quantity);

      const partner = await Partner.findOne({ name: sender, userId });
      if (partner) {
        partner.Balance -= parseFloat(amount);
        partner.Quantity -= parseFloat(quantity);
        await partner.save();
      }
    } else {
      throw new Error("Invalid transaction type!");
    }

    await account.save();

    const trx = await Transaction.create({
      sender: finalSender,
      receiver: finalReceiver,
      trxType,
      fromAccount,
      createdAt,
      amount,
      rate,
      quantity,
      onBehalfOf,
      note,
      userId,
    });

    // Store for Person (transactions list only; ledger handled separately)
    if (trxType === "send") {
      person.transactions.sendTrx.push({
        trxId: trx._id,
        name: receiver,
        onBehalfOf: onBehalfOf || null,
        amount,
        rate,
        quantity,
      });
    } else {
      person.transactions.receiveTrx.push({
        trxId: trx._id,
        name: sender,
        amount,
        rate,
        quantity,
      });
    }

    await person.save();

    return JSON.parse(JSON.stringify(trx));
  } catch (error) {
    return { error: error.message };
  }
};

// ─── Delete (Reversal) Transaction ───────────────────────────────
const deleteTransaction = async ({ userId, id }) => {
  try {
    if (!userId) throw new Error("userId is required!");
    if (!id) throw new Error("Transaction id is required!");

    const trx = await Transaction.findOne({ _id: id, userId });
    if (!trx)
      throw new Error("Transaction not found or does not belong to user!");

    if (trx.reversed)
      throw new Error("This transaction has already been reversed!");

    const account = await Account.findOne({ name: trx.fromAccount, userId });
    if (!account) throw new Error("Associated account not found!");

    // Build reversal
    const reverseTrx = new Transaction({
      sender: trx.receiver,
      receiver: trx.sender,
      trxType: trx.trxType === "send" ? "receive" : "send",
      fromAccount: trx.fromAccount,
      onBehalfOf: trx.onBehalfOf,
      amount: trx.amount,
      rate: trx.rate,
      quantity: trx.quantity,
      userId: trx.userId,
      reversed: true,
      reversedTrxId: trx._id,
      note: "Reversal entry created for Transaction No: " + trx.trxNumber,
    });
    await reverseTrx.save();

    // Adjust account
    if (trx.trxType === "send") {
      account.balance += parseFloat(trx.amount);
      account.quantity += parseFloat(trx.quantity);
    } else {
      account.balance -= parseFloat(trx.amount);
      account.quantity -= parseFloat(trx.quantity);
    }
    await account.save();

    // Partner adjustments
    if (trx.trxType === "send" && trx.onBehalfOf) {
      const partner = await Partner.findOne({ name: trx.onBehalfOf, userId });
      if (partner) {
        partner.Balance -= parseFloat(trx.amount);
        partner.Quantity -= parseFloat(trx.quantity);
        await partner.save();
      }
    }
    if (trx.trxType === "receive") {
      const partner = await Partner.findOne({ name: trx.sender, userId });
      if (partner) {
        partner.Balance += parseFloat(trx.amount);
        partner.Quantity += parseFloat(trx.quantity);
        await partner.save();
      }
    }

    // Person update
    const person = await Person.findOne({ userId });
    if (person) {
      if (reverseTrx.trxType === "send") {
        person.transactions.sendTrx.push({
          trxId: reverseTrx._id,
          name: reverseTrx.receiver,
          onBehalfOf: reverseTrx.onBehalfOf || null,
          amount: reverseTrx.amount,
          rate: reverseTrx.rate,
          quantity: reverseTrx.quantity,
        });
      } else {
        person.transactions.receiveTrx.push({
          trxId: reverseTrx._id,
          name: reverseTrx.sender,
          amount: reverseTrx.amount,
          rate: reverseTrx.rate,
          quantity: reverseTrx.quantity,
        });
      }
      await person.save();
    }

    trx.reversed = true;
    trx.reversedTrxId = reverseTrx._id;
    await trx.save();

    return {
      success: true,
      message: "Reversal transaction created successfully",
      reversal: reverseTrx,
    };
  } catch (error) {
    return { error: error.message };
  }
};

// ─── Get Transactions ───────────────────────────────
const getTransactions = async ({ userId }) => {
  try {
    if (!userId) throw new Error("userId is required!");

    const trxList = await Transaction.find({ userId })
      .sort({ trxNumber: -1 }) // 🔥 sort by trxNumber instead of date
      .select("-__v"); // 🔥 remove Mongo’s internal field

    return JSON.parse(JSON.stringify(trxList));
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = { createTransaction, deleteTransaction, getTransactions };
