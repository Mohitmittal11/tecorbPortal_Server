import express from "express";
import adminRoute from "./admin.route.js";
import salarySlip from "./salarySlip.route.js";
import employee from "./employee.route.js";
import leaves from "./leaves.route.js";
import holiday from "./holidays.route.js";
import employeeUser from "./user-employee/user-employee.route.js";
import assets from "./assets.route.js";
import compLeave from "./compLeave.route.js";
import policy from "./policy.route.js";

const router = express.Router();
router.use("/admin", adminRoute);
router.use("/user-employee", employeeUser);
router.use("/salarySlip", salarySlip);
router.use("/employee", employee);
router.use("/leaves", leaves);
router.use("/assets", assets);
router.use("/holidays", holiday);
router.use("/compLeave", compLeave);
router.use("/policy", policy);

export default router;
