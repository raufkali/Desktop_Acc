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

    // find current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("User not found!");
    }

    // find account for this user
    const account = await Account.findOne({ name: fromAccount, userId });
    if (!account) {
      throw new Error("Account not Found!, please create Account first");
    }

    // ensure Person exists for current user
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
      account.balance = parseFloat(account.balance) - parseFloat(amount);
      if (onBehalfOf) {
        // sending on behalf of a partner
        const partner = await Partner.findOne({ name: onBehalfOf, userId });
        if (!partner) throw new Error("Partner doesn't exist");

        partner.Balance = parseFloat(partner.Balance) + parseFloat(amount);
        partner.Quantity = parseFloat(partner.Quantity) + parseFloat(quantity);
        await partner.save();
      }
    } else if (trxType === "receive") {
      finalSender = sender;
      finalReceiver = currentUser.username || currentUser.name || "Me";
      account.balance = parseFloat(account.balance) + parseFloat(amount);

      // if received from a partner, adjust their balance
      const partner = await Partner.findOne({ name: sender, userId });
      if (partner) {
        console.log(partner);
        partner.Balance = parseFloat(partner.Balance) - parseFloat(amount);
        partner.Quantity = parseFloat(partner.Quantity) - parseFloat(quantity);

        await partner.save();
      }
    } else {
      throw new Error("Invalid transaction type!");
    }

    // save updated account balance
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
      onBehalfOf,
      note,
      userId,
    });

    // update Person transactions
    if (trxType === "send") {
      person.transactions.sendTrx.push({
        trxId: trx._id,
        name: receiver,
        onBehalfOf: onBehalfOf || null,
        amount,
        rate,
        quantity,
      });

      if (onBehalfOf) {
        // 🔹 case: sending on behalf of someone
        let cred = person.creditors.find((c) => c.name === onBehalfOf);
        if (cred) {
          let newAmnt = cred.amount - amount;
          if (newAmnt > 0) {
            cred.amount = newAmnt;
          } else if (newAmnt === 0) {
            person.creditors = person.creditors.filter(
              (c) => c.name !== onBehalfOf
            );
          } else {
            // became debitor
            person.creditors = person.creditors.filter(
              (c) => c.name !== onBehalfOf
            );
            person.debitors.push({
              trxId: trx._id,
              name: onBehalfOf,
              amount: Math.abs(newAmnt),
              rate,
              quantity,
            });
          }
        } else {
          // not creditor, so add as debitor
          person.debitors.push({
            trxId: trx._id,
            name: onBehalfOf,
            amount,
            rate,
            quantity,
          });
        }
      } else {
        // 🔹 case: direct send to someone
        let cred = person.creditors.find((c) => c.name === receiver);
        if (cred) {
          let newAmnt = cred.amount - amount;
          if (newAmnt > 0) {
            cred.amount = newAmnt;
          } else if (newAmnt === 0) {
            person.creditors = person.creditors.filter(
              (c) => c.name !== receiver
            );
          } else {
            person.creditors = person.creditors.filter(
              (c) => c.name !== receiver
            );
            person.debitors.push({
              trxId: trx._id,
              name: receiver,
              amount: Math.abs(newAmnt),
              rate,
              quantity,
            });
          }
        } else {
          person.debitors.push({
            trxId: trx._id,
            name: receiver,
            amount,
            rate,
            quantity,
          });
        }
      }
    } else if (trxType === "receive") {
      // receiving always means the sender becomes creditor
      person.transactions.receiveTrx.push({
        trxId: trx._id,
        name: sender,
        amount,
        rate,
        quantity,
      });

      let cred = person.creditors.find((c) => c.name === sender);
      if (cred) {
        cred.amount += amount;
      } else {
        person.creditors.push({
          trxId: trx._id,
          name: sender,
          amount,
          rate,
          quantity,
        });
      }
    }

    await person.save();

    return JSON.parse(JSON.stringify(trx));
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

      // reverse partner balance if involved
      if (trx.onBehalfOf) {
        const partner = await Partner.findOne({ name: trx.onBehalfOf, userId });
        if (partner) {
          partner.Balance =
            parseFloat(partner.Balance) - parseFloat(trx.amount);
          await partner.save();
        }
      }
    } else if (trx.trxType === "receive") {
      account.balance = parseFloat(account.balance) - parseFloat(trx.amount);

      // reverse partner if sender was a partner
      const partner = await Partner.findOne({ name: trx.sender, userId });
      if (partner) {
        partner.Balance = parseFloat(partner.Balance) + parseFloat(trx.amount);
        await partner.save();
      }
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
