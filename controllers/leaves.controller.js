import LeavesModal from "../models/leaves/leaves.modal.js";
import mongoose from "mongoose";
import { validateLeavesUpdate } from "../utils/updateLeaveValidation.js";
import LeavesListModal from "../models/leaves/leavesList.modal.js";
import EmployeeModal from "../models/admin/employee.modal.js";

export const checkingId = async (identifier) => {
  try {
    let checked;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      checked = await LeavesModal.findById(identifier);
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

// List Programs with pagination
export const leavesList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const leaveType = req.query.leaveType;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};

    if (leaveType) {
      if (leaveType == "Working") {
        query['selectedDates.halfType'] = "Working";
      }
      if (leaveType == "Full Day") {
        query['selectedDates.halfType'] = "Full Day";
      }
      if (leaveType == "Second Half") {
        query['selectedDates.halfType'] = "Second Half";
      }
      if (leaveType == "First Half") {
        query['selectedDates.halfType'] = "First Half";
      }
      if (leaveType == "Comp") {
        query['selectedDates.halfType'] = "Comp";
      }
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.employeeName = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * pageSize;

    const aggregationPipeline = [
      {
        $match: query
      },
      {
        $project: {
          _id: 1,
          employeeId: 1,
          employeeName: 1,
          totalLeave: 1,
          leaveType: 1,
          status: 1,
          from: 1,
          to: 1,
          reason: 1,
          approvedBy: 1,
          selectedDates: {
            $filter: {
              input: "$selectedDates",
              as: "date",
              cond: {
                $ifNull: [
                  leaveType ? { $eq: ["$$date.halfType", query['selectedDates.halfType'].toString()] } : true,
                  true
                ]
              }
            }
          },
          createdAt: 1,
          updatedAt: 1,
          __v: 1
        }
      },
      { $skip: skip },
      { $limit: pageSize }
    ];

    let items;
    let totalCount;

    if (leaveType || status || search) {
      items = await LeavesListModal.aggregate(aggregationPipeline);
      totalCount = await LeavesListModal.countDocuments(query);
    } else {
      items = await LeavesListModal.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize);
      totalCount = await LeavesListModal.countDocuments();
    }

    res.status(200).json({
      message: "Leave List",
      code: 200,
      leaves: items,
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

// Leaves Details
export const leavesDetails = async (req, res) => {
  try {

    let _id = req.params?.leavesId;

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

// Add Leaves
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

    const leaves = new LeavesModal(reqBody);
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

// Update Leaves
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

    const updateResult = await LeavesModal.updateOne(
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

//Dlete Leave
export const deleteLeaves = async (req, res) => {
  try {
    let _id = req.params?.leavesId;

    const checkLeavesExist = await checkingId(_id);
    if (!checkLeavesExist) {
      return res.status(400).json({
        code: 400,
        message: "Leaves does not exist.",
      });
    }
    await LeavesModal.deleteOne({
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
export const updateLeavesStatus = async (req, res) => {
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
    const countLeaves = await LeavesModal.find({ _id: id, status: "pending" });
    if (status == "Rejected") {
      await LeavesModal.updateOne({ _id: id }, { $set: leaves });
    }

    else if (status == "Approved") {
      let count = 0;

      countLeaves.forEach(element => {
        if (element.selectedDates.length >= 0) {
          element.selectedDates.forEach(val => {
            if (val.halfType == "Full Day") {
              count += 1
            }
            if (val.halfType == "First Half" || val.halfType == "Second Half") {
              count += 0.5
            }
            if (val.halfType == "Comp") {
              count -= 1
            }
          })
        }
      });

      const remainingLeaves = employee.personalInfo.remainingLeave - count;
      console.log(count, remainingLeaves, "count");
      //update employeeData
      await EmployeeModal.updateOne({ "personalInfo.employeeId": employeeId }, { $set: { "personalInfo.remainingLeave": remainingLeaves } });
      await LeavesModal.updateOne({ _id: id }, { $set: leaves });
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

//Approve List
export const approveList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const skip = (page - 1) * pageSize;
    const items = await LeavesListModal.find({ status: "Approved" }, null, { skip, limit: pageSize });
    const totalCount = await LeavesListModal.countDocuments();

    res.status(200).json({
      message: "Leave List",
      code: 200,
      leaves: items,
      totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}