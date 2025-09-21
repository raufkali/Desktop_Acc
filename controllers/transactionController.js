const Transaction = require("../models/Trx");
const User = require("../models/User");
const Account = require("../models/Account");
const Person = require("../models/Person");
const Partner = require("../models/Partner");
// ─── Create Transaction ───────────────────────────────
const createTransaction = async (data) => {
  try {
    console.log("DATA: ", data);
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

    // find current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("User not found!");
    }
    console.log("CURRENT USER: ", currentUser);
    // find account for this user
    const account = await Account.findOne({
      name: fromAccount,
      userId: userId,
    });
    console.log("Account: ", account);
    if (!account) {
      throw new Error("Account not Found!, please create Account first");
    }

    // ensure Person exists for current user
    let person = await Person.findOne({ userId });
    console.log("Person:", person);
    let finalSender, finalReceiver;

    if (trxType === "send") {
      finalSender = currentUser.username;
      finalReceiver = receiver;
      account.balance = parseFloat(account.balance) - parseFloat(amount);
    } else if (trxType === "receive") {
      finalSender = sender;
      finalReceiver = currentUser.username;
      account.balance = parseFloat(account.balance) + parseFloat(amount);
    } else {
      throw new Error("Invalid transaction type!");
    }

    // save updated balance
    await account.save();

    // create transaction
    const trx = await Transaction.create({
      sender: finalSender,
      receiver: finalReceiver,
      trxType,
      fromAccount,
      createdAt,
      amount,
      rate,
      quantity,
      note,
      userId,
    });

    // update Person transactions
    if (trxType === "send") {
      person.transactions.sendTrx.push(trx._id);

      person.debitors.push({
        trxId: trx._id,
        name: receiver,
        amount,
        rate,
        quantity,
      });
    } else if (trxType === "receive") {
      person.transactions.receiveTrx.push(trx._id);

      person.creditors.push({
        trxId: trx._id,
        name: sender,
        amount,
        rate,
        quantity,
      });
    }

    await person.save();

    return JSON.parse(JSON.stringify(trx)); // serialize
  } catch (error) {
    return { error: error.message };
  }
};

// ─── Delete Transaction ───────────────────────────────
const deleteTransaction = async ({ id, userId }) => {
  try {
    const trx = await Transaction.findById(id);
    if (!trx) throw new Error("Transaction not found!");

    if (trx.userId.toString() !== userId.toString()) {
      throw new Error("Not authorized to delete this transaction!");
    }

    // find account
    const account = await Account.findOne({ name: trx.fromAccount, userId });
    if (!account) throw new Error("Account not found for this transaction!");

    // reverse account balance
    if (trx.trxType === "send") {
      account.balance = parseFloat(account.balance) + parseFloat(trx.amount);
    } else if (trx.trxType === "receive") {
      account.balance = parseFloat(account.balance) - parseFloat(trx.amount);
    }
    await account.save();

    // remove from Person as well
    const person = await Person.findOne({ userId });
    if (person) {
      if (trx.trxType === "send") {
        person.transactions.sendTrx.pull(trx._id);
        person.debitors = person.debitors.filter(
          (d) => d.trxId.toString() !== trx._id.toString()
        );
      } else if (trx.trxType === "receive") {
        person.transactions.receiveTrx.pull(trx._id);
        person.creditors = person.creditors.filter(
          (c) => c.trxId.toString() !== trx._id.toString()
        );
      }
      await person.save();
    }

    // delete trx
    await trx.deleteOne();

    return {
      message: "Transaction deleted and reversed successfully",
      reversed: {
        sender: trx.receiver,
        receiver: trx.sender,
        trxType: trx.trxType === "send" ? "receive" : "send",
        amount: trx.amount,
        rate: trx.rate,
        quantity: trx.quantity,
        userId: trx.userId,
      },
    };
  } catch (error) {
    return { error: error.message };
  }
};

// ─── Get Transactions ───────────────────────────────
const getTransactions = async ({ userId }) => {
  try {
    if (!userId) throw new Error("userId is required to fetch transactions!");

    const trxList = await Transaction.find({ userId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(trxList));
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = { createTransaction, deleteTransaction, getTransactions };
