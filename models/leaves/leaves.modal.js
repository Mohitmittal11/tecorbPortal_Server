import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Id is required'],
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      select: false,
    },
    totalLeave: {
      type: Number,
      required: true
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      select: false,
    },
    status: {
      type: String,
    },
    approvedBy: {
      type: String,
    },
    from: {
      type: String,
      required: [true, 'From date is required'],
      select: false,
    },
    to: {
      type: String,
      required: [true, 'To date is required'],
      select: false,
    },
    remainingLeaves: {
      type: String,
      select: false,
    },
    approveReason: {
      type: String,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      select: false,
    },
    selectedDates: {
      type: [
        {
          date: {
            type: String,
            required: true,
          },
          halfType: {
            type: String,
            required: true,
          },
        }
      ],
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: 'At least one selected date is required',
      },
      required: [true, 'At least one selected date is required'],
    },
  },
  {
    timestamps: true,
  }
);

const LeaveModal = mongoose.model("Leave", leaveSchema);

export default LeaveModal;
