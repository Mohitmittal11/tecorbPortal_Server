import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  fromDate: {
    type: String,
    required: [true, "From date is required"],
  },
  toDate: {
    type: String,
    required: [true, "To date is required"],
  },
  description: {
    type: String,
  },
},{timestamps: true});

const HolidayModal = mongoose.model("Holiday", holidaySchema);
export default HolidayModal;
