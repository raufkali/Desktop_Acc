const { app, BrowserWindow } = require("electron");
const path = require("path");
const connectDB = require("./db/db");
require("./ipc");

let mainWindow; // <-- Add this line

app.on("ready", async () => {
  await connectDB();
  createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173"); // <-- Change win to mainWindow
}
