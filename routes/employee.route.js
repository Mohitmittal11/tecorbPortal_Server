import express from "express";
import { body } from "express-validator";
import {
  addEmployee,
  deleteEmployee,
  employeeAnniversaryList,
  employeeBirthDayList,
  employeeDetails,
  employeeList,
  updateEmployee,
  updateEmployeeStatus,
  notificationCount,
  getNotificationsForEmployee,
  notificationStatusChange,
} from "../controllers/employee.controller.js";

import { upload } from "../utils/cloudinary.js";
import { adminTokenAuth } from "../middlewares/adminToken.middleware.js";
const router = express.Router();

// Add Employee
router.post(
  "/add",
  adminTokenAuth,
  upload.single("employeeImage"),
  addEmployee
);

// Get Employee List
router.get("/", adminTokenAuth, employeeList);

// Get Employee Details
router.get("/employeeDetail/:employeeId", adminTokenAuth, employeeDetails);
// router.get("/:employeeId", adminTokenAuth, employeeDetails);

// Update Employee Details
router.put(
  "/:employeeId",
  adminTokenAuth,
  upload.single("employeeImage"),
  updateEmployee
);

// Delete Employee
router.delete("/:employeeId", adminTokenAuth, deleteEmployee);

// Update Employee Status
router.post("/status", adminTokenAuth, updateEmployeeStatus);

// BIrthday List
router.get("/birthday", employeeBirthDayList);

// Anniversary List
router.get("/anniversary", employeeAnniversaryList);

//notificationCountBy EmployeeId
router.get("/notificationCount", notificationCount);

//getNotificationsForEmployeeById
router.get("/getAllNotifications", getNotificationsForEmployee);

//Birthday and Anniversary Notification
// router.get("/todayNotification", employeeBirthdayAnniversary)

//Notification Status Change
router.patch("/updateNotificationCount", notificationStatusChange);

export default router;