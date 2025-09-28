const { ipcMain } = require("electron");

// Helper to strip Mongoose docs into plain JSON
const serialize = (data) => JSON.parse(JSON.stringify(data));

// ─── Users ───────────────────────────────
const {
  createUser,
  loginUser,
  getProfile,
  updateProfile,
} = require("./controllers/userController");

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
ipcMain.handle("user:updateProfile", async (event, { userId, data }) => {
  try {
    const updated = await updateProfile(userId, data);
    return serialize(updated);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle("user:getProfile", async (event, userId) => {
  try {
    const profile = await getProfile(userId);
    return serialize(profile);
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

ipcMain.handle("transaction:delete", async (event, ids) => {
  try {
    const result = await deleteTransaction(ids); // 👈 wrapped in object
    return serialize(result);
  } catch (err) {
    return { error: err.message };
  }
});

// ─── Persons ─────────────────────────────
const {
  createPerson,
  deletePerson,
  getPerson,
} = require("./controllers/personController");
ipcMain.handle("person:get", async (event, userId) => {
  try {
    const result = await getPerson(userId);
    return serialize(result);
  } catch (err) {
    return { error: err.message };
  }
});
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

// ─── Partners ────────────────────────────
const {
  createPartner,
  deletePartner,
  updatePartner,
  getAllPartners,
} = require("./controllers/partnerController");

ipcMain.handle("partner:create", async (event, payload) => {
  try {
    const partner = await createPartner(payload);
    return serialize(partner); // ✅ ensure serializable
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("partner:delete", async (event, { id, userId }) => {
  try {
    const result = await deletePartner({ id, userId });
    return serialize(result); // ✅ ensure serializable
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("partner:update", async (event, payload) => {
  try {
    const updated = await updatePartner(payload);
    return serialize(updated); // ✅ ensure serializable
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("partner:getAll", async (event, { userId }) => {
  try {
    const partners = await getAllPartners({ userId });
    return serialize(partners); // ✅ ensure serializable
  } catch (err) {
    return { error: err.message };
  }
});

// ─── Summary ─────────────────────────────
const { getSummary } = require("./controllers/summaryController");

ipcMain.handle("summary:get", async (event, { userId, filterType, date }) => {
  try {
    if (!userId) throw new Error("userId is required");

    // Pass filter info to controller
    const summary = await getSummary(userId, filterType, date);

    return { success: true, data: summary };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─── Dashboard ───────────────────────────
const { getDashboard } = require("./controllers/dashboardController");
ipcMain.handle("dashboard:get", async (event, userId) => {
  try {
    const dashboard = await getDashboard(userId);
    return serialize(dashboard);
  } catch (err) {
    return { error: err.message };
  }
});
