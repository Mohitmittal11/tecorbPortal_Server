import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    typeofNotification: {
      type: String,
      required: true,
      enum: ["leave", "Birthday", "Anniversary"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
    },
    leaveId: {
      type: String,
    },
    employeeId: {
      type: String,
    },
    time: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const NotificationModal = mongoose.model("Notification", notificationSchema);
export default NotificationModal;
