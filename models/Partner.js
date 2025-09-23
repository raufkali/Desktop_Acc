const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  Balance: {
    type: Number,
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
