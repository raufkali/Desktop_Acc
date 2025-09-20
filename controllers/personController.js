// controllers/personController.js
const Person = require("../models/Person");

// ─── Create Person ───────────────────────────────
const createPerson = async ({ name, user_id }) => {
  try {
    const newPerson = new Person({
      name,
      user_id,
    });
    await newPerson.save();
    return { success: true, person: newPerson };
  } catch (error) {
    console.error("Error creating person:", error);
    return { success: false, error: error.message };
  }
};

// ─── Delete Person ───────────────────────────────
const deletePerson = async (id) => {
  try {
    const deleted = await Person.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Person not found" };
    }
    return { success: true, deleted };
  } catch (error) {
    console.error("Error deleting person:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createPerson,
  deletePerson,
};
