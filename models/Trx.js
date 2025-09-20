const mongoose = require("mongoose");

const newTrx = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  trxType: {
    type: String,
    enum: ["send", "receive"], // fixed spelling
    required: true,
  },
  fromAccount: {
    type: String,
    required: true,
    default: "personal",
  },
  onBehalfOf: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
  },
  rate: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  userId: {
    type: String, // since your User schema uses String for _id
    required: true,
  },
  note: {
    type: String,
  },
});

// ✅ Add index here
newTrx.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", newTrx);

module.exports = Transaction;
