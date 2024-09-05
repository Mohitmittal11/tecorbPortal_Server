import mongoose from "mongoose";
import { validateLeavesUpdate } from "../utils/updateLeaveValidation.js";
import EmployeeModal from "../models/admin/employee.modal.js";
import CompLeaveModal from "../models/leaves/compLeave.modal.js";
import jwt from "jsonwebtoken";

export const checkingId = async (identifier) => {
    try {
        let checked;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            checked = await CompLeaveModal.findById(identifier);
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

// Add Leaves
export const addCompLeaves = async (req, res) => {
    try {
        const reqBody = req.body;
        const { employeeId } = reqBody
        const checkEmployeeID = await EmployeeModal.findOne({
            "personalInfo.employeeId": employeeId,
        });

        if (!checkEmployeeID) {
            return res.status(400).json({
                code: 400,
                message: "Employee ID not exists.",
            });
        }

        const leaves = new CompLeaveModal(reqBody);
        await leaves.save();
        res.status(201).json({
            code: 201,
            message: "Compensate Leaves added successfully",
            leaves: leaves,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

export const compLeavesList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const status = req.query.status;

        let query = {};
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * pageSize;
        const items = await CompLeaveModal.find(query)
            .select('+employeeName +leaveType +from +to +remainingLeaves +reason')
            .skip(skip)
            .limit(pageSize);
        const totalCount = await CompLeaveModal.countDocuments(query);

        res.status(200).json({
            message: "Compensate List",
            code: 200,
            leave: items,
            totalCount,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};



// Leaves Details
export const compLeavesDetails = async (req, res) => {
    try {
        let _id = req.params?.leavesId;

        const checkLeavesExist = await checkingId(_id);
        if (!checkLeavesExist) {
            return res.status(400).json({
                code: 400,
                message: "Leavesdoes not exist.",
            });
        }
        const checkDetails = await CompLeaveModal.findOne({ _id }).select('+employeeName +leaveType +from +to +remainingLeaves +reason');  // Include fields with select: false


        res.status(201).json({
            message: "Leaves Details",
            code: 200,
            leaves: checkDetails,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// Update Leaves
export const updateCompLeaves = async (req, res) => {
    try {
        const reqBody = req.body;
        let _id = req.params?.leavesId;

        //validation for the leave
        if (!_id) {
            return res.status(400).json({
                message: "Leaves Id is required.",
            });
        }
        const updatedAt = new Date();

        //check existing leave
        const checkLeavesExist = await checkingId(_id);

        if (!checkLeavesExist) {
            return res.status(400).json({
                code: 400,
                message: "Leaves does not exist.",
            });
        }

        if (Object.keys(reqBody).length === 0) {
            return res.status(400).json({
                message: "No data provided for update.",
            });
        }

        const validationErrors = validateLeavesUpdate(reqBody);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: "Validation failed for update data.",
                errors: validationErrors,
            });
        }

        const updateResult = await CompLeaveModal.updateOne(
            { _id: req.params?.leavesId },
            { $set: reqBody }
        );

        if (updateResult.nModified === 0) {
            return res.status(400).json({
                message: "No changes applied, update unsuccessful.",
            });
        }

        res.status(201).json({
            message: "Compensate Leaves Updated Successfully",
            code: 200,
            leaves: reqBody,
            updatedAt,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

//Delete Leave
export const deleteCompLeaves = async (req, res) => {
    try {
        let _id = req.params?.leavesId;

        const checkLeavesExist = await checkingId(_id);
        if (!checkLeavesExist) {
            return res.status(400).json({
                code: 400,
                message: "Leaves does not exist.",
            });
        }
        await CompLeaveModal.deleteOne({
            _id: req.params?.leavesId,
        });

        res.status(201).json({
            message: "Leaves Deleted Successfully",
            code: 200,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// Update Leaves Status
export const updateCompLeavesStatus = async (req, res) => {
    try {
        const { id, employeeId, status, approvedBy, approveReason } = req.body;
        const leaves = {
            status,
            approvedBy,
            approveReason
        };

        if (!id) {
            return res.status(400).json({
                message: "Leave Id not correct.",
            });
        }
        if (!employeeId) {
            return res.status(400).json({
                message: "Employee Id not correct.",
            });
        }
        if (!status) {
            return res.status(400).json({
                message: "status is required.",
            });
        }
        if (status !== "Approved" && status !== "Rejected") {
            return res.status(400).json({
                message: "status value is incorrect.",
            });
        }
        if (!approvedBy) {
            return res.status(400).json({
                message: "approvedBy is Required.",
            });
        }
        if (!approveReason) {
            return res.status(400).json({
                message: "reason is required.",
            });
        }

        const checkLeavesExist = await checkingId(id);
        if (!checkLeavesExist) {
            return res.status(400).json({
                code: 400,
                message: "Leaves does not exist.",
            });
        }

        // get employee data
        const employee = await EmployeeModal.findOne({ "personalInfo.employeeId": employeeId });
        if (!employee) {
            return res.status(400).json({
                code: 400,
                message: "Employee not found.",
            });
        }

        //count leave
        const countLeaves = await CompLeaveModal.find({ _id: id, status: "pending" });
        if (status == "Rejected") {
            await CompLeaveModal.updateOne({ _id: id }, { $set: leaves });
        }
        else if (status == "Approved") {
            let count = 0;

            countLeaves.forEach(element => {
                if (element.selectedDates.length >= 0) {
                    element.selectedDates.forEach(val => {
                        if (val.halfType == "Comp") {
                            count += 1
                        }
                    })
                }
            });

            const remainingLeaves = employee.personalInfo.remainingLeave + count;
            //update employeeData
            await EmployeeModal.updateOne({ "personalInfo.employeeId": employeeId }, { $set: { "personalInfo.remainingLeave": remainingLeaves } });
            await CompLeaveModal.updateOne({ _id: id }, { $set: leaves });
        }

        res.status(201).json({
            message: "Leaves status updated successfully",
            code: 200,
            leaves:
                req.body,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// //Approve List
// export const approveCompList = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const pageSize = parseInt(req.query.pageSize) || 20;

//         const skip = (page - 1) * pageSize;
//         const items = await CompLeaveModal.find({ status: "Approved" }, null, { skip, limit: pageSize });
//         const totalCount = await CompLeaveModal.countDocuments();

//         res.status(200).json({
//             message: "Leave List",
//             code: 200,
//             leaves: items,
//             totalCount,
//             page,
//             pageSize,
//         });
//     } catch (err) {
//         res.status(500).json({
//             message: err.message,
//         });
//     }
// }



// Employee Compensate leave

export const employeeCompLeave = async (req, res) => {
    try {
        let token = req?.headers["x-auth"];
        token = token.substring(7)
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // console.log(verified.data, "verified");
        const _id = verified.data
        const checkDetails = await EmployeeModal.findOne({ _id });
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;

        const skip = (page - 1) * pageSize;

        // console.log(checkDetails, "checkDetails");
        if (checkDetails) {
            const userId = checkDetails.personalInfo.employeeId
            // console.log(userId, "userId");
            // const leaves = await LeavesModal.find({ employeeId: userId });

            const items = await CompLeaveModal.find({ employeeId: userId }, null, { skip, limit: pageSize });
            const totalCount = await CompLeaveModal.countDocuments({ employeeId: userId });
            // console.log(leaves, "leaves");
            res.status(200).json({
                code: 200,
                leaves: items,
                totalCount: totalCount
            });
        } else {
            res.status(404).json({
                message: "Employee details not found"
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};