const { contextBridge, ipcRenderer } = require("electron");

// ─── Users & Transactions ───────────────────────────────
contextBridge.exposeInMainWorld("api", {
  // Users
  createUser: (data) => ipcRenderer.invoke("user:create", data),
  loginUser: (data) => ipcRenderer.invoke("user:login", data),
  getProfile: (userId) => ipcRenderer.invoke("user:getProfile", userId),
  updateProfile: (userId, data) =>
    ipcRenderer.invoke("user:updateProfile", { userId, data }),
  // Transactions
  createTransaction: (data) => ipcRenderer.invoke("transaction:create", data),
  deleteTransaction: (ids) => ipcRenderer.invoke("transaction:delete", ids),
  getTransactions: (userId) => ipcRenderer.invoke("transaction:get", userId),
});

// ─── Persons ───────────────────────────────
contextBridge.exposeInMainWorld("personAPI", {
  create: (personData) => ipcRenderer.invoke("person:create", personData),
  get: (userId) => ipcRenderer.invoke("person:get", userId),
  delete: (ids) => ipcRenderer.invoke("person:delete", ids),
});

// ─── Accounts ──────────────────────────────
contextBridge.exposeInMainWorld("accountAPI", {
  create: (data) => ipcRenderer.invoke("account:create", data),
  delete: (id) => ipcRenderer.invoke("account:delete", id),
  getAll: (userId) => ipcRenderer.invoke("account:getAll", userId),
});

// ─── Partners ──────────────────────────────
contextBridge.exposeInMainWorld("partnerAPI", {
  create: (data) => ipcRenderer.invoke("partner:create", data),
  delete: (payload) => ipcRenderer.invoke("partner:delete", payload),
  update: (payload) => ipcRenderer.invoke("partner:update", payload),
  getAll: (payload) => ipcRenderer.invoke("partner:getAll", payload),
});

// ─── Summary ──────────────────────────────
contextBridge.exposeInMainWorld("summaryAPI", {
  get: (userId, filterType = "day", date = new Date()) =>
    ipcRenderer.invoke("summary:get", { userId, filterType, date }),
});

// ─── Dashboard ──────────────────────────────
contextBridge.exposeInMainWorld("dashboardAPI", {
  get: (userId) => ipcRenderer.invoke("dashboard:get", userId),
});
