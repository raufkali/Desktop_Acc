const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  _id: {
    type: String, // store as string instead of ObjectId
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  Balance: {
    type: Number,
    default: 0,
  },
  Quantity: {
    type: Number,
    default: 0,
  },
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  userId: {
    type: String,
    required: true,
  },
});

partnerModel = mongoose.model("Partner", partnerSchema);
module.exports = partnerModel;
