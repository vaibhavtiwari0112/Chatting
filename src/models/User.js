const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  contacts: [{ type: String }], // List of phone numbers of contacts
});

module.exports = mongoose.model("User", UserSchema);
