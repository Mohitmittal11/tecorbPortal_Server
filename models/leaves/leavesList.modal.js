// const mongoose = require('mongoose');
import mongoose from "mongoose";

const leavesSchema = new mongoose.Schema({
    employeeId: String,
    employeeName: String,
    leaveType: String,
    from: String,
    to: String,
    remainingLeaves: String,
    reason: String,
    selectedDates: [
        {
            date: String,
            halfType: String,
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const LeavesListModal = mongoose.model('Leaves', leavesSchema);

export default LeavesListModal;
