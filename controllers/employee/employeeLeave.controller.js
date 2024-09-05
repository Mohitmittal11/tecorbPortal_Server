// import EmployeeModal from "../../models/admin/employee.modal";
// import LeaveModal from "../../models/leaves/leaves.modal.js"
import EmployeeModal from "../../models/admin/employee.modal.js";
import jwt from "jsonwebtoken";
import LeaveModal from "../../models/leaves/leaves.modal.js";
import { validateLeavesUpdate } from "../../utils/updateLeaveValidation.js";
import { checkingId } from "../leaves.controller.js";
import LeavesListModal from "../../models/leaves/leavesList.modal.js";


//Add Leave
export const addLeaves = async (req, res) => {
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

        const leaves = new LeaveModal(reqBody);
        await leaves.save();
        res.status(201).json({
            code: 201,
            message: "Leaves added successfully",
            leaves: leaves,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// Employee Leave List
export const employeeLeave = async (req, res) => {
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
            // const leaves = await LeaveModal.find({ employeeId: userId });

            const items = await LeavesListModal.find({ employeeId: userId }, null, { skip, limit: pageSize });
            const totalCount = await LeaveModal.countDocuments({ employeeId: userId });
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

// Update Leave
export const updateLeaves = async (req, res) => {
    try {
        const reqBody = req.body;
        let _id = req.params?.leavesId;

        //validation for the leaev
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

        const updateResult = await LeaveModal.updateOne(
            { _id: req.params?.leavesId },
            { $set: reqBody }
        );

        if (updateResult.nModified === 0) {
            return res.status(400).json({
                message: "No changes applied, update unsuccessful.",
            });
        }

        res.status(201).json({
            message: "Leaves Updated Successfully",
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

// Leave Detail
export const leavesDetails = async (req, res) => {
    try {
        // console.log("leave details", req.params)
        let _id = req.params?.id;

        const checkLeavesExist = await checkingId(_id);
        if (!checkLeavesExist) {
            return res.status(400).json({
                code: 400,
                message: "Leavesdoes not exist.",
            });
        }
        const checkDetails = await LeavesListModal.findOne({ _id });

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
