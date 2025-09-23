const mongoose = require("mongoose");

// Debit/Credit sub-schema
const debCredSchema = new mongoose.Schema({
  trxId: {
    type: String,
    default: () => new mongoose.Schema.Types.ObjectId().toString(),
  },
  name: String,
  amount: Number,
  quantity: Number,
  rate: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

// Transaction Schema
const trxSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  amount: Number,
  rate: Number,
  onBehalfOf: String,

  quantity: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

// Person schema
const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    transactions: {
      sendTrx: [trxSchema],
      receiveTrx: [trxSchema],
    },
    debitors: [debCredSchema],
    creditors: [debCredSchema],
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Person = mongoose.model("Person", personSchema);
module.exports = Person;
