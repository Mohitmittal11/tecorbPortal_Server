import mongoose from "mongoose";
import SalarySlipModal from "../models/salarySlip.modal.js";

const checkingId = async (identifier) => {
  try {
    let checked;
    // Check if the identifier is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      checked = await SalarySlipModal.findById(identifier);
    }
    if (!checked) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error occurred while checking salarySlip:", error);
    return false;
  }
};

// Add Salary Slip
export const addSalarySlip = async (req, res) => {
  try {
    const reqBody = req.body;
    // const checkSalarySlip = await SalarySlipModal.findOne({ title });
    // if (checkSalarySlip) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: "SalarySlipModal already exist.",
    //   });
    // }
    console.log("----------reqBody-------", reqBody);
    const salarySlip = new SalarySlipModal(reqBody);
    await salarySlip.save();
    console.log("----------salary slip-------", salarySlip);
    res.status(201).json({
      code: 201,
      message: "Salary slip added successfully",
      salarySlip: salarySlip,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// List Programs with pagination
export const salarySlipList = async (req, res) => {
  try {
    //  const checkSalarySlip = await SalarySlipModal.find();
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size to 10 if not provided

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;
    const items = await SalarySlipModal.find().skip(skip).limit(pageSize);
    const totalCount = await SalarySlipModal.countDocuments();
    res.status(200).json({
      message: "Programs List",
      code: 200,
      salarySlip: items,
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

// SalarySlipModal Details
export const salarySlipDetails = async (req, res) => {
  try {
    let _id = req.params?.salarySlipId;

    const checkSalarySlipExist = await checkingId(_id);
    if (!checkSalarySlipExist) {
      return res.status(400).json({
        code: 400,
        message: "SalarySlipModal does not exist.",
      });
    }
    const checkDetails = await SalarySlipModal.findOne({ _id });

    if (!checkDetails) {
      return res.status(400).json({
        code: 400,
        message: "SalarySlipModal not exist.",
      });
    }

    res.status(201).json({
      message: "SalarySlipModal Details",
      code: 200,
      salarySlip: checkDetails,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update SalarySlipModal
export const updateSalarySlip = async (req, res) => {
  try {
    const reqBody = req.body;
    let _id = req.params?.salarySlipId;
    // const salarySlip = {
    //   title,
    //   description,
    //   status,
    // };
    if (!_id) {
      return res.status(400).json({
        message: "SalarySlipModal Id not correct.",
      });
    }

    // const checkSalarySlip = await SalarySlipModal.findOne({ title });
    // if (checkSalarySlip) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: "SalarySlipModal already exist.",
    //   });
    // }
    const updatedAt = new Date(); // Add a field named 'createdAt' with the current date and time
    console.log("updatedAt", updatedAt);
    const checkSalarySlipExist = await checkingId(_id);

    if (!checkSalarySlipExist) {
      return res.status(400).json({
        code: 400,
        message: "Salary slip does not exist.",
      });
    }

    await SalarySlipModal.updateOne(
      { _id: req.params?.salarySlipId },
      { $set: reqBody }
    );

    res.status(201).json({
      message: "SalarySlipModal Updated Successfully",
      code: 200,
      salarySlip: reqBody,
      updatedAt,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete SalarySlipModal
export const deleteSalarySlip = async (req, res) => {
  try {
    let _id = req.params?.salarySlipId;

    if (!_id) {
      return res.status(400).json({
        message: "SalarySlipModal Id not correct.",
      });
    }

    const checkSalarySlipExist = await checkingId(_id);
    if (!checkSalarySlipExist) {
      return res.status(400).json({
        code: 400,
        message: "SalarySlipModal does not exist.",
      });
    }
    await SalarySlipModal.deleteOne({
      _id: req.params?.salarySlipId,
    });

    res.status(201).json({
      message: "SalarySlipModal Deleted Successfully",
      code: 200,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update SalarySlipModal Status
export const updateSalarySlipStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const salarySlip = {
      status,
    };
    if (!id) {
      return res.status(400).json({
        message: "SalarySlipModal Id not correct.",
      });
    }

    const checkSalarySlipExist = await checkingId(id);
    if (!checkSalarySlipExist) {
      return res.status(400).json({
        code: 400,
        message: "SalarySlips does not exist.",
      });
    }
    const checkSalarySlip = await SalarySlipModal.findOne({ _id: id });
    await SalarySlipModal.updateOne({ _id: id }, { $set: salarySlip });

    res.status(201).json({
      message: "SalarySlipModal status updated successfully",
      code: 200,
      salarySlip: {
        id: checkSalarySlip._id,
        title: checkSalarySlip.title,
        description: checkSalarySlip.description,
        status: salarySlip.status,
      },
      id: checkSalarySlip._id,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getSalaryatEmployeeSide = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    console.log(
      `Employee Id is ${employeeId} and ${month} and year is ${year}`
    );
    const response = await SalarySlipModal.findOne({
      "personalInfo.employeeCode": employeeId,
      "commonInfo.slipMonth": month,
      "commonInfo.slipYear": year,
    });

    if (response) {
      res.status(200).json({
        statusCode: 200,
        message: "Data Found Successfully",
        data: response,
      });
    } else {
      res.json({ statusCode: 204, message: "No Data Found", data: response });
    }
  } catch (err) {
    console.log("error is", err);
    res.status(500).json({
      message: err.message,
    });
  }
};
