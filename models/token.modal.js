import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: String,
  token: String,
});

const TokenModal = mongoose.model("Token", tokenSchema);

export default TokenModal;
