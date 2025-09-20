const User = require("../models/User"); // adjust path as needed
const bcrypt = require("bcrypt");
const Person = require("../models/Person");
// Create new user
const createUser = async ({ data }) => {
  try {
    const { username, email, password } = data;
    if (!username || !email || !password) {
      throw new Error("All fields are mandatory!");
    }

    // Hash password
    const hashPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashPass,
    });

    // Return without password
    const { password: _, ...safeUser } = newUser.toObject();
    return safeUser;
  } catch (error) {
    throw error;
  }
};

// Login user
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

    // Compare passwords
    const match = await bcrypt.compare(password, getUser.password);
    if (!match) {
      throw new Error("Invalid Password!");
    }

    // Return user without password
    const { password: _, ...safeUser } = getUser.toObject();
    return safeUser;
  } catch (error) {
    throw error;
  }
};

module.exports = { createUser, loginUser };
