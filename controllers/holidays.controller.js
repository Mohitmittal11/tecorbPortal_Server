import mongoose from "mongoose";
import HolidayModal from "../models/holiday.modal.js";

// Checking ID
export const checkingId = async (identifier) => {
    try {
        let checked;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            checked = await HolidayModal.findById(identifier);
        }
        if (!checked) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error occurred while checking leaves:", error);
        return false;
    }
};


// Holidays List 
export const holidayList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;

        const skip = (page - 1) * pageSize;
        const items = await HolidayModal.find({}, null, { skip, limit: pageSize });
        const totalCount = await HolidayModal.countDocuments();

        res.status(200).json({
            message: "Holiday List",
            code: 200,
            holiday: items,
            totalCount,
            page,
            pageSize,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Add Holidays
export const addHoliday = async (req, res) => {
    try {
        const reqBody = req.body
        const { name } = reqBody
        const checkHoliday = await HolidayModal.findOne({ name: name })
        if (checkHoliday) {
            return res.status(400).json({
                code: 400,
                message: "Holiday already exists.",
            });
        }

        const holiday = new HolidayModal(reqBody);
        await holiday.save();
        res.status(201).json({
            code: 201,
            message: "Holiday added successfully",
            holiday: holiday,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Update Holidays
export const updateHoliday = async (req, res) => {
    try {
        const reqBody = req.body;
        let _id = req.params?.Id;

        //validation for the leaev
        if (!_id) {
            return res.status(400).json({
                message: "Holiday Id is required.",
            });
        }
        const updatedAt = new Date();

        //check existing leave
        const checkLeavesExist = await checkingId(_id);

        if (!checkLeavesExist) {
            return res.status(400).json({
                code: 400,
                message: "Holiday does not exist.",
            });
        }

        if (Object.keys(reqBody).length === 0) {
            return res.status(400).json({
                message: "No data provided for update.",
            });
        }

        const updateResult = await HolidayModal.updateOne(
            // { _id: req.params?.leavesId },
            { $set: reqBody }
        );

        if (updateResult.nModified === 0) {
            return res.status(400).json({
                message: "No changes applied, update unsuccessful.",
            });
        }

        res.status(201).json({
            message: "Holiday Updated Successfully",
            code: 200,
            holiday: reqBody,
            updatedAt,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Delete Holiday
export const deleteHoliday = async (req, res) => {
    try {
        let _id = req.params?.Id;

        const checkLeavesExist = await checkingId(_id);
        if (!checkLeavesExist) {
            return res.status(400).json({
                code: 400,
                message: "Holiday does not exist.",
            });
        }
        await HolidayModal.deleteOne({
            _id: req.params?.Id,
        });

        res.status(201).json({
            message: "Holiday Deleted Successfully",
            code: 200,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Holiday detail
export const holidayDetails = async (req, res) => {
    try {
        let _id = req.params?.Id;

        const checkEmployeeExist = await checkingId(_id);
        if (!checkEmployeeExist) {
            return res.status(400).json({
                code: 400,
                message: "Holiday does not exist.",
            });
        }
        const checkDetails = await HolidayModal.findOne({ _id });

        if (!checkDetails) {
            return res.status(400).json({
                code: 400,
                message: "Holiday not exist.",
            });
        }

        res.status(201).json({
            message: "Holiday Details",
            code: 200,
            Holiday: checkDetails,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};
