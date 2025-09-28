const Transaction = require("../models/Trx");
const User = require("../models/User");
const Account = require("../models/Account");
const Person = require("../models/Person");
const Partner = require("../models/Partner");

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

    // helpers (modularized)
    const parseNum = (v) => {
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };

    // find creditor by name (returns reference)
    const findCred = (person, name) =>
      person.creditors.find((c) => c.name === name);

    // find debitor by name
    const findDeb = (person, name) =>
      person.debitors.find((d) => d.name === name);

    // helper to remove creditor
    const removeCred = (person, name) => {
      person.creditors = person.creditors.filter((c) => c.name !== name);
    };

    // helper to remove debitor
    const removeDeb = (person, name) => {
      person.debitors = person.debitors.filter((d) => d.name !== name);
    };

    // helper to ensure numeric fields exist on an entry
    const ensureEntryNumbers = (entry) => {
      entry.amount = parseNum(entry.amount);
      entry.quantity = parseNum(entry.quantity);
    };

    /**
     * Process logic for a "send" transaction relative to 'person' ledger for 'name'
     * According to your rules:
     * - If none -> make creditor with amount+quantity
     * - If creditor exists -> increase (add) amount & quantity
     * - If debitor exists -> subtract (debitor - sent). Evaluate signs and
     *   transition between debitor <-> creditor as described.
     */
    const processSendForName = (person, name, amt, qty, trxId) => {
      amt = parseNum(amt);
      qty = parseNum(qty);

      const cred = findCred(person, name);
      const deb = findDeb(person, name);

      if (cred) {
        // existing creditor -> add amounts
        ensureEntryNumbers(cred);
        cred.amount = parseNum(cred.amount) + amt;
        cred.quantity = parseNum(cred.quantity) + qty;
        return;
      }

      if (deb) {
        // existing debitor -> subtract what we sent from debitor owed -> debitor.amount - amt
        ensureEntryNumbers(deb);
        let newAmnt = parseNum(deb.amount) - amt;
        let newQty = parseNum(deb.quantity) - qty;

        // both positive -> remain debitor
        if (newAmnt > 0 && newQty > 0) {
          deb.amount = newAmnt;
          deb.quantity = newQty;
          return;
        }

        // both zero -> remove debitor
        if (newAmnt === 0 && newQty === 0) {
          removeDeb(person, name);
          return;
        }

        // both negative -> become creditor with absolute values
        if (newAmnt < 0 && newQty < 0) {
          removeDeb(person, name);
          person.creditors.push({
            trxId,
            name,
            amount: Math.abs(newAmnt),
            rate,
            quantity: Math.abs(newQty),
          });
          return;
        }

        // mixed cases (either one <=0 or <0) -> split into remaining debitor positive parts and creditor for negative parts
        const remainingDebAmount = newAmnt > 0 ? newAmnt : 0;
        const remainingDebQty = newQty > 0 ? newQty : 0;
        const credAmt = newAmnt < 0 ? Math.abs(newAmnt) : 0;
        const credQty = newQty < 0 ? Math.abs(newQty) : 0;

        // update or remove debitor depending on remaining positives
        if (remainingDebAmount === 0 && remainingDebQty === 0) {
          removeDeb(person, name);
        } else {
          deb.amount = remainingDebAmount;
          deb.quantity = remainingDebQty;
        }

        // if any creditor part to add
        if (credAmt > 0 || credQty > 0) {
          const existingCred = findCred(person, name);
          if (existingCred) {
            ensureEntryNumbers(existingCred);
            existingCred.amount = parseNum(existingCred.amount) + credAmt;
            existingCred.quantity = parseNum(existingCred.quantity) + credQty;
          } else {
            person.creditors.push({
              trxId,
              name,
              amount: credAmt,
              rate,
              quantity: credQty,
            });
          }
        }

        return;
      }

      // none exists -> create new creditor (as per your spec)
      person.creditors.push({
        trxId,
        name,
        amount: amt,
        rate,
        quantity: qty,
      });
    };

    /**
     * Process logic for a "receive" transaction relative to 'person' ledger for 'name'
     * According to your rules:
     * - If none -> make him debitor (you specified that for receive)
     * - If debitor exists -> add amount & quantity (increase debitor)
     * - If creditor exists -> subtract received from creditor (creditor - received) and evaluate transitions
     */
    const processReceiveForName = (person, name, amt, qty, trxId) => {
      amt = parseNum(amt);
      qty = parseNum(qty);

      const cred = findCred(person, name);
      const deb = findDeb(person, name);

      if (!cred && !deb) {
        // none -> make debitor (per your instruction)
        person.debitors.push({
          trxId,
          name,
          amount: amt,
          rate,
          quantity: qty,
        });
        return;
      }

      if (deb) {
        // existing debitor -> add amounts (they owe more)
        ensureEntryNumbers(deb);
        deb.amount = parseNum(deb.amount) + amt;
        deb.quantity = parseNum(deb.quantity) + qty;
        return;
      }

      if (cred) {
        // existing creditor -> reduce creditor by received (creditor.amount - amt)
        ensureEntryNumbers(cred);
        let newAmnt = parseNum(cred.amount) - amt;
        let newQty = parseNum(cred.quantity) - qty;

        // both positive -> remain creditor
        if (newAmnt > 0 && newQty > 0) {
          cred.amount = newAmnt;
          cred.quantity = newQty;
          return;
        }

        // both zero -> remove creditor
        if (newAmnt === 0 && newQty === 0) {
          removeCred(person, name);
          return;
        }

        // both negative -> become debitor with absolute values
        if (newAmnt < 0 && newQty < 0) {
          removeCred(person, name);
          person.debitors.push({
            trxId,
            name,
            amount: Math.abs(newAmnt),
            rate,
            quantity: Math.abs(newQty),
          });
          return;
        }

        // mixed cases -> split: remaining creditor positives and add debitor for negative parts
        const remainingCredAmount = newAmnt > 0 ? newAmnt : 0;
        const remainingCredQty = newQty > 0 ? newQty : 0;
        const debAmt = newAmnt < 0 ? Math.abs(newAmnt) : 0;
        const debQty = newQty < 0 ? Math.abs(newQty) : 0;

        if (remainingCredAmount === 0 && remainingCredQty === 0) {
          removeCred(person, name);
        } else {
          cred.amount = remainingCredAmount;
          cred.quantity = remainingCredQty;
        }

        if (debAmt > 0 || debQty > 0) {
          const existingDeb = findDeb(person, name);
          if (existingDeb) {
            ensureEntryNumbers(existingDeb);
            existingDeb.amount = parseNum(existingDeb.amount) + debAmt;
            existingDeb.quantity = parseNum(existingDeb.quantity) + debQty;
          } else {
            person.debitors.push({
              trxId,
              name,
              amount: debAmt,
              rate,
              quantity: debQty,
            });
          }
        }

        return;
      }
    };

    // ─── End of helpers ─────────────────────────────────

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

      // create transaction entry in person's sendTrx
      // push before ledger updates so we have trx._id later; but to keep consistent with prior flow,
      // we will create the trx below and then update ledger.
    } else if (trxType === "receive") {
      finalSender = sender;
      finalReceiver = currentUser.username || currentUser.name || "Me";
      account.balance = parseFloat(account.balance) + parseFloat(amount);

      // if received from a partner, adjust their balance
      const partner = await Partner.findOne({ name: sender, userId });
      if (partner) {
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

    // update Person transactions & ledger entries using helpers
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
        // If sending on behalf of someone, we only process the onBehalfOf name (per your note)
        processSendForName(person, onBehalfOf, amount, quantity, trx._id);
      } else {
        // Normal send: handle receiver in ledger
        processSendForName(person, receiver, amount, quantity, trx._id);
      }
    } else if (trxType === "receive") {
      // receiving always means the sender becomes creditor/debitor logic (per your rules)
      person.transactions.receiveTrx.push({
        trxId: trx._id,
        name: sender,
        amount,
        rate,
        quantity,
      });

      // handle ledger for sender (receive scenario)
      processReceiveForName(person, sender, amount, quantity, trx._id);
    }

    await person.save();

    return JSON.parse(JSON.stringify(trx));
  } catch (error) {
    return { error: error.message };
  }
};

// ─── Delete Transaction ───────────────────────────────
const deleteTransaction = async (data) => {
  try {
    console.log("Fetching data: ", data);

    const trx = await Transaction.findById(id);
    if (!trx) throw new Error("Transaction not found!");
    console.log("Trx: ", trx);
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
          partner.Quantity =
            parseFloat(partner.Quantity) - parseFloat(trx.quantity);
          await partner.save();
        }
      }
    } else if (trx.trxType === "receive") {
      account.balance = parseFloat(account.balance) - parseFloat(trx.amount);

      // reverse partner if sender was a partner
      const partner = await Partner.findOne({ name: trx.sender, userId });
      if (partner) {
        partner.Balance = parseFloat(partner.Balance) + parseFloat(trx.amount);
        partner.Quantity =
          parseFloat(partner.Quantity) + parseFloat(trx.quantity);
        await partner.save();
      }
    }
    await account.save();

    // reverse Person changes
    const person = await Person.findOne({ userId });
    if (person) {
      // helper to safely parse numbers
      const parseNum = (v) => {
        const n = Number(v);
        return Number.isNaN(n) ? 0 : n;
      };

      // remove from sendTrx/receiveTrx
      if (trx.trxType === "send") {
        person.transactions.sendTrx = person.transactions.sendTrx.filter(
          (t) => t.trxId.toString() !== trx._id.toString()
        );

        // reverse ledger → undo what send did by applying receive logic
        const entryName = trx.onBehalfOf || trx.receiver;
        const cred = person.creditors.find((c) => c.name === entryName);
        const deb = person.debitors.find((d) => d.name === entryName);

        if (cred) {
          // subtracting creditor becomes receive reversal
          cred.amount = parseNum(cred.amount) - parseNum(trx.amount);
          cred.quantity = parseNum(cred.quantity) - parseNum(trx.quantity);
          if (cred.amount <= 0 && cred.quantity <= 0) {
            person.creditors = person.creditors.filter(
              (c) => c.name !== entryName
            );
          }
        } else if (deb) {
          // if it had flipped into debitor earlier, reverse that
          deb.amount = parseNum(deb.amount) + parseNum(trx.amount);
          deb.quantity = parseNum(deb.quantity) + parseNum(trx.quantity);
        }
      } else if (trx.trxType === "receive") {
        person.transactions.receiveTrx = person.transactions.receiveTrx.filter(
          (t) => t.trxId.toString() !== trx._id.toString()
        );

        // reverse ledger → undo what receive did by applying send logic
        const entryName = trx.sender;
        const deb = person.debitors.find((d) => d.name === entryName);
        const cred = person.creditors.find((c) => c.name === entryName);

        if (deb) {
          // subtracting debitor becomes send reversal
          deb.amount = parseNum(deb.amount) - parseNum(trx.amount);
          deb.quantity = parseNum(deb.quantity) - parseNum(trx.quantity);
          if (deb.amount <= 0 && deb.quantity <= 0) {
            person.debitors = person.debitors.filter(
              (d) => d.name !== entryName
            );
          }
        } else if (cred) {
          cred.amount = parseNum(cred.amount) + parseNum(trx.amount);
          cred.quantity = parseNum(cred.quantity) + parseNum(trx.quantity);
        }
      }

      await person.save();
    }

    // delete trx
    await trx.deleteOne();

    return {
      message: "Transaction deleted and fully reversed successfully",
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
