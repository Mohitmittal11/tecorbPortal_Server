import Employee from "../models/admin/employee.modal.js";
import mongoose from "mongoose";
import EmployeeModal from "../models/admin/employee.modal.js";
import { handleUpload } from "../utils/cloudinary.js";
import moment from "moment"
import NotificationModal from "../models/notification.modal.js";

const checkingId = async (identifier) => {
  try {
    let checked;
    // Check if the identifier is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      checked = await Employee.findById(identifier);
    }
    if (!checked) {
      return false;
    }
    return checked;
  } catch (error) {
    console.error("Error occurred while checking employee:", error);
    return false;
  }
};

export const addEmployee = async (req, res) => {
  // console.log(req.file, "req");
  try {
    // const { personalInfo } = req.body;
    const info = req.body;
    const { employeeId, employeeOfficeEmail } = info;
    // Check if employeeId already exists
    const checkEmployeeID = await EmployeeModal.findOne({
      "personalInfo.employeeId": employeeId,
    });
    if (checkEmployeeID) {
      return res.status(400).json({
        code: 400,
        message: "Employee ID already exists.",
      });
    }

    // Check if employeeEmail already exists
    const checkEmployeeEmail = await EmployeeModal.findOne({
      "personalInfo.employeeOfficeEmail": employeeOfficeEmail,
    });
    if (checkEmployeeEmail) {
      return res.status(400).json({
        code: 400,
        message: "Employee email already exists.",
      });
    }

    let employee;

    // Upload employeeImage
    if (req.file?.buffer) {

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);

      // Save employee to database
      employee = new EmployeeModal({
        personalInfo: {
          ...info,
          employeeImage: cldRes.url
        },
      });
    }
    else {
      employee = new EmployeeModal({

        personalInfo: {
          ...info.personalInfo,
        },
      });
    }

    // Save employee to database
    await employee.save();

    res.status(201).json({
      code: 201,
      message: "Employee added successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  try {
    let personalInfo = req.body;
    let _id = req.params?.employeeId;
    const { employeeId } = personalInfo;
    const checkEmployeeID = await EmployeeModal.findOne({
      "personalInfo.employeeId": employeeId,
    });

    const checkEmployeeExist = await checkingId(_id);

    if (!checkEmployeeExist) {
      return res.status(400).json({
        code: 400,
        message: "Employee does not exist.",
      });
    }

    // Upload Image
    if (req.file?.buffer) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);
      personalInfo = {
        ...personalInfo,
        employeeImage: cldRes.url,
      };
    }

    await Employee.updateOne(
      { _id: req.params?.employeeId },
      { $set: { personalInfo } }
    );

    res.status(201).json({
      message: "Employee Updated Successfully",
      code: 200,
      employee: {
        personalInfo,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Employee List with pagination
export const employeeList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    let search = req.query.search;

    let query = Employee.find();
    if (search) {
      query = query.or([
        { "personalInfo.employeeName": { $regex: search, $options: "i" } },
        { "personalInfo.employeeId": { $regex: search, $options: "i" } },
      ]);
    }

    const skip = (page - 1) * pageSize;
    const items = await query.skip(skip).limit(pageSize);
    const totalCount = await Employee.countDocuments(query);
    res.status(200).json({
      message: "Employees List",
      code: 200,
      employee: items,
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

// Employee Details
export const employeeDetails = async (req, res) => {
  try {
    let _id = req.params?.employeeId;

    const checkEmployeeExist = await checkingId(_id);
    if (!checkEmployeeExist) {
      return res.status(400).json({
        code: 400,
        message: "Employee does not exist.",
      });
    }
    const checkDetails = await Employee.findOne({ _id });

    if (!checkDetails) {
      return res.status(400).json({
        code: 400,
        message: "Employee not exist.",
      });
    }

    res.status(201).json({
      message: "Employee Details",
      code: 200,
      employee: checkDetails,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    let _id = req.params?.employeeId;

    if (!_id) {
      return res.status(400).json({
        message: "Employee Id not correct.",
      });
    }

    const checkEmployeeExist = await checkingId(_id);
    if (!checkEmployeeExist) {
      return res.status(400).json({
        code: 400,
        message: "Employee does not exist.",
      });
    }
    await Employee.deleteOne({
      _id: req.params?.employeeId,
    });

    res.status(201).json({
      message: "Employee Deleted Successfully",
      code: 200,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Employee Status
export const updateEmployeeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const employee = {
      status,
    };
    if (!id) {
      return res.status(400).json({
        message: "Employee Id not correct.",
      });
    }

    const checkEmployeeExist = await checkingId(id);
    if (!checkEmployeeExist) {
      return res.status(400).json({
        code: 400,
        message: "Employees does not exist.",
      });
    }
    const checkEmployee = await Employee.findOne({ _id: id });
    await Employee.updateOne({ _id: id }, { $set: employee });

    res.status(201).json({
      message: "Employee status updated successfully",
      code: 200,
      employee: {
        id: checkEmployee._id,
        title: checkEmployee.title,
        description: checkEmployee.description,
        status: employee.status,
      },
      id: checkEmployee._id,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// Birthday List
export const employeeBirthDayList = async (req, res) => {
  try {
    const items = await Employee.find();
    const today = moment().startOf('day');

    const sortedEmployees = items.map(employee => {
      const employeeDOB = moment(employee.personalInfo.employeeDOB, 'DD-MM-YYYY');
      let nextBirthday = moment(employeeDOB).year(today.year());
      if (nextBirthday.isBefore(today)) {
        nextBirthday = moment(employeeDOB).year(today.year() + 1);
      }
      return {
        employee: employee,
        nextBirthday: nextBirthday
      };
    }).sort((a, b) => a.nextBirthday.valueOf() - b.nextBirthday.valueOf());

    const upcomingBirthdays = sortedEmployees.filter(item => item.nextBirthday.isSameOrAfter(today)).slice(0, 7).map(item => {
      const daysToNextBirthday = item.nextBirthday.diff(today, 'days');
      return {
        name: item.employee.personalInfo.employeeName,
        dob: item.employee.personalInfo.employeeDOB,
        employeeId: item.employee.personalInfo.employeeId,
        daysToNextBirthday: daysToNextBirthday,
        employeeImage: item.employee.personalInfo.employeeImage
      };
    });

    res.status(200).json({
      message: "Upcoming Birthdays",
      code: 200,
      upcomingBirthdays: upcomingBirthdays
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// Anniversary List
export const employeeAnniversaryList = async (req, res) => {
  try {
    const items = await Employee.find();
    const today = moment().startOf('day');

    const sortedEmployees = items.map(employee => {
      const employeeDOJ = moment(employee.personalInfo.employeeDOJ, 'DD-MM-YYYY');
      const nextAnniversary = moment(employeeDOJ).year(today.year());
      if (nextAnniversary.isBefore(today)) {
        nextAnniversary.add(1, 'year');
      }
      return {
        employee: employee,
        nextAnniversary: nextAnniversary
      };
    }).sort((a, b) => a.nextAnniversary - b.nextAnniversary);

    // console.log(sortedEmployees.length, "so");

    const upcomingAnniversary = sortedEmployees.slice(0, 7).filter(item => item.nextAnniversary.isSameOrAfter(today)).map(item => {
      const daysToNextAnniversary = item.nextAnniversary.diff(today, 'days');
      return {
        name: item.employee.personalInfo.employeeName,
        doj: item.employee.personalInfo.employeeDOJ,
        employeeId: item.employee.personalInfo.employeeId,
        daysToNextAnniversary: daysToNextAnniversary,
        employeeImage: item.employee.personalInfo.employeeImage
      };
    });
    res.status(200).json({
      message: "Upcoming Anniversary",
      code: 200,
      upcomingAnniversary: upcomingAnniversary
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//Notification count api By employee id
export const notificationCount = async (req, res) => {
  try {
    const employeeId = req.query.employeeId;
    console.log(employeeId, "fghjnk");

    const checkEmployeeID = await EmployeeModal.find({
      "personalInfo.employeeId": employeeId,
    });

    if (checkEmployeeID === null) {
      return res.status(400).json({
        code: 400,
        message: "Employee does not exists.",
      });
    } else {
      const notificationCount = await NotificationModal.countDocuments({
        employeeId: employeeId.trim(),
        read: false,
      });
      console.log("Notification count is", notificationCount);
      if (!notificationCount) {
        res.json({
          message: "Notification does not exist for this employee",
          notificationCount: notificationCount,
        });
      } else {
        console.log(notificationCount);
        res.status(200).json({ notificationcount: notificationCount });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Notification List for a particular employee By employee id
export const getNotificationsForEmployee = async (req, res) => {
  try {
    const employeeId = req.query.employeeId;
    console.log(employeeId);
    const checkEmployeeID = await EmployeeModal.findOne({
      "personalInfo.employeeId": employeeId,
    });

    if (!checkEmployeeID) {
      return res.status(400).json({
        code: 400,
        message: "Employee ID not exists.",
      });
    } else {
      const notifications = await NotificationModal.find({
        $or: [
          { employeeId: employeeId.trim() },
          {
            employeeId: { $exists: false },
            typeofNotification: "Birthday",
          },
          {
            employeeId: { $exists: false },
            typeofNotification: "Anniversary",
          },
        ],
      }).sort({ createdAt: -1 });
      if (!notifications) {
        res
          .status(404)
          .json({ message: "Notification for employeeId does not exist" });
      } else {
        res.status(200).json({ data: notifications });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update Notification status
export const notificationStatusChange = async (req, res) => {
  try {
    const reqBody = req.body;

    const employeeId = reqBody.employeeId;
    console.log(employeeId, "notifivagg");

    const checkEmployeeID = await EmployeeModal.findOne({
      "personalInfo.employeeId": employeeId.trim(),
    });

    if (!checkEmployeeID) {
      return res.status(400).json({
        code: 400,
        message: "Employee ID not exists.",
      });
    } else {
      const newStatus = await NotificationModal.updateMany(
        { employeeId: employeeId },
        { $set: { read: true } }
      );
      res.status(200).json({ data: newStatus });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
