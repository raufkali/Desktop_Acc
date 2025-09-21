const { contextBridge, ipcRenderer } = require("electron");

// ─── Users & Transactions ───────────────────────────────
contextBridge.exposeInMainWorld("api", {
  // Users
  createUser: (data) => ipcRenderer.invoke("user:create", data),
  loginUser: (data) => ipcRenderer.invoke("user:login", data),

  // Transactions
  createTransaction: (data) => ipcRenderer.invoke("transaction:create", data),
  deleteTransaction: (id) => ipcRenderer.invoke("transaction:delete", id),
  getTransactions: (userId) => ipcRenderer.invoke("transaction:get", userId),
});

// ─── Persons ───────────────────────────────
contextBridge.exposeInMainWorld("personAPI", {
  create: (personData) => ipcRenderer.invoke("person:create", personData),
  delete: (id) => ipcRenderer.invoke("person:delete", id),
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
