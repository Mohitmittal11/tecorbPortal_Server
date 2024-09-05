import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    policyData: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const policyModal = mongoose.model("policy", policySchema);
export default policyModal;
