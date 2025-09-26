const Partner = require("../models/Partner");

// ─── Create Partner ───────────────────────────────
const createPartner = async ({ name, phone, Balance, userId, Quantity }) => {
  const exsist = await Partner.findOne({ name: name, userId: userId });
  if (exsist) {
    throw new Error("Partner already exsists");
  }
  const partner = new Partner({
    name,
    phone,
    Balance: Balance || 0,
    userId,
    Quantity,
  });
  return await partner.save();
};

// ─── Delete Partner ───────────────────────────────
const deletePartner = async ({ id, userId }) => {
  return await Partner.findOneAndDelete({ _id: id, userId });
};

// ─── Update Partner ───────────────────────────────
const updatePartner = async ({ id, userId, data }) => {
  return await Partner.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true }
  );
};

// ─── Get All Partners ───────────────────────────────
const getAllPartners = async ({ userId }) => {
  return await Partner.find({ userId });
};

module.exports = {
  createPartner,
  deletePartner,
  updatePartner,
  getAllPartners,
};
