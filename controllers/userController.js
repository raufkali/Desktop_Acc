const User = require("../models/User"); // adjust path as needed
const bcrypt = require("bcrypt");
const Person = require("../models/Person");

// ─── Create New User ───────────────────────────────
const createUser = async ({ data }) => {
  try {
    const { username, email, password } = data;
    if (!username || !email || !password) {
      throw new Error("All fields are mandatory!");
    }

    // check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new Error("User already exists!");
    }

    // hash password
    const hashPass = await bcrypt.hash(password, 10);

    // create User
    const newUser = await User.create({
      username,
      email,
      password: hashPass,
    });

    // create Person linked to User
    await Person.create({
      name: username,
      transactions: {
        sendTrx: [],
        receiveTrx: [],
      },
      creditors: [],
      debitors: [],
      userId: newUser._id.toString(), // ✅ link to user
    });

    // return safe User (no password)
    const { password: _, ...safeUser } = newUser.toObject();
    return safeUser;
  } catch (error) {
    throw error;
  }
};

// ─── Login User ───────────────────────────────
const loginUser = async ({ data }) => {
  try {
    const { email, password } = data;
    if (!email || !password) {
      throw new Error("All fields are mandatory!");
    }

    const getUser = await User.findOne({ email });
    if (!getUser) {
      throw new Error("Email doesn't exist!");
    }

    // check password
    const match = await bcrypt.compare(password, getUser.password);
    if (!match) {
      throw new Error("Invalid password!");
    }

    const { password: _, ...safeUser } = getUser.toObject();
    return safeUser;
  } catch (error) {
    throw error;
  }
};

// get profile
const getProfile = async (userId) => {
  try {
    const res = await User.findById(userId).select("-password");
    if (!res) throw new Error("User not found");
    return res.toObject();
  } catch (error) {
    throw error;
  }
};

// update Profile
const updateProfile = async (userId, { username, email, password }) => {
  try {
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password"); // ✅ chain select AFTER update

    if (!updatedUser) throw new Error("User not found");

    return updatedUser.toObject();
  } catch (err) {
    throw err;
  }
};

module.exports = { createUser, loginUser, getProfile, updateProfile };
