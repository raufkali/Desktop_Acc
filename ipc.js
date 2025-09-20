const { ipcMain } = require("electron");

// Helper to strip Mongoose docs into plain JSON
const serialize = (data) => JSON.parse(JSON.stringify(data));

// ─── Users ───────────────────────────────
const { createUser, loginUser } = require("./controllers/userController");

ipcMain.handle("user:create", async (event, payload) => {
  try {
    const user = await createUser({ data: payload });
    return serialize(user);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle("user:login", async (event, payload) => {
  try {
    const user = await loginUser({ data: payload });
    return serialize(user);
  } catch (error) {
    return { error: error.message };
  }
});

// ─── Transactions ────────────────────────
const {
  createTransaction,
  deleteTransaction,
  getTransactions,
} = require("./controllers/transactionController");

ipcMain.handle("transaction:get", async (event, userId) => {
  try {
    const result = await getTransactions({ userId });
    return serialize(result);
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("transaction:create", async (event, data) => {
  try {
    const trx = await createTransaction(data);
    return serialize(trx);
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("transaction:delete", async (event, id) => {
  try {
    const result = await deleteTransaction(id);
    return serialize(result);
  } catch (err) {
    return { error: err.message };
  }
});

// ─── Persons ─────────────────────────────
const {
  createPerson,
  deletePerson,
} = require("./controllers/personController");

ipcMain.handle("person:create", async (event, payload) => {
  try {
    const result = await createPerson(payload);
    return serialize(result);
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("person:delete", async (event, id) => {
  try {
    const result = await deletePerson(id);
    return serialize(result);
  } catch (err) {
    return { error: err.message };
  }
});
// ─── Accounts ────────────────────────────
const {
  createAccount,
  deleteAccount,
  getAllAccounts,
} = require("./controllers/accountController");

ipcMain.handle("account:create", async (event, payload) => {
  try {
    const account = await createAccount(payload);
    return serialize(account);
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("account:delete", async (event, accountId) => {
  try {
    const result = await deleteAccount(accountId);
    return serialize(result);
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("account:getAll", async (event, userId) => {
  try {
    return await getAllAccounts(userId); // pass userId
  } catch (err) {
    return { error: err.message };
  }
});
