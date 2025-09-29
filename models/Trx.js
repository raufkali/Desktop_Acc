const mongoose = require("mongoose");

const newTrx = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  trxNumber: {
    type: String,
    unique: true, // keep unique, but remove required
  },
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  reversed: {
    type: Boolean,
    default: false,
  },
  reversedTrxId: {
    type: String,
  },
  trxType: {
    type: String,
    enum: ["send", "receive"],
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
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
});

// Auto-increment trxNumber
newTrx.pre("save", async function (next) {
  if (this.isNew) {
    const lastTrx = await mongoose
      .model("Transaction")
      .findOne({})
      .sort({ trxNumber: -1 }) // sort by trxNumber
      .exec();

    if (lastTrx && lastTrx.trxNumber) {
      const lastNumber = parseInt(lastTrx.trxNumber, 10);
      this.trxNumber = String(lastNumber + 1).padStart(3, "0");
    } else {
      this.trxNumber = "001";
    }
  }
  next();
});

newTrx.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", newTrx);

module.exports = Transaction;
