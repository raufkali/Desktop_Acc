const Account = require("../models/Account");

// ─── Create Account ───────────────────────────────
const createAccount = async ({ userId, name, balance }) => {
  try {
    // check if account exsists
    const exsists = await Account.findOne({ userId, name });
    if (exsists) {
      return {
        success: false,
        message: "Account with this name already exsists",
      };
    }
    const account = new Account({ userId, name, balance });
    await account.save();
    return { success: true, account };
  } catch (error) {
    console.error("Error creating account:", error);
    return { success: false, message: error.message };
  }
};

// ─── Delete Account ───────────────────────────────
const deleteAccount = async ({ accountId }) => {
  try {
    const deleted = await Account.findByIdAndDelete(accountId);
    if (!deleted) {
      return { success: false, message: "Account not found" };
    }
    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, message: error.message };
  }
};

// ─── Get All Accounts For User ─────────────────────
const getAllAccounts = async (userId) => {
  try {
    const accounts = await Account.find({ userId });
    return { success: true, accounts };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  createAccount,
  deleteAccount,
  getAllAccounts,
};
