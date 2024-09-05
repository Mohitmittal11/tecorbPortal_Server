import crypto from "crypto";
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamp: true,
  }
);

adminSchema.methods.setPassword = function (password) {
  this.password = crypto
    .pbkdf2Sync(password, "this.salt", 1000, 64, "sha512")
    .toString("hex");
};

adminSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, "this.salt", 1000, 64, "sha512")
    .toString("hex");

  return this.password === hash;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
