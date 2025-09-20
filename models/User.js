const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: {
    type: String, // store as string instead of ObjectId
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
