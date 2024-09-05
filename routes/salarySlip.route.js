import express from "express";
import { body } from "express-validator";
// import {adminTokenAuth } from "../middlewares/token.middleware.js";
import {
  addSalarySlip,
  deleteSalarySlip,
  salarySlipDetails,
  salarySlipList,
  updateSalarySlip,
  updateSalarySlipStatus,
  getSalaryatEmployeeSide,
} from "../controllers/salarySlip.controller.js";
const router = express.Router();


// GET salary slip at employee side

router.get("/getSalarySlip", getSalaryatEmployeeSide);

// Add SalarySlip
router.post(
  "/add",
  //   body("name").exists().withMessage("Name is required"),
  //   body("status").exists().withMessage("Status is required"),
  addSalarySlip
);

// Get Salary Slip List
router.get("/", salarySlipList);

// Get Salary Slip Details
router.get("/:salarySlipId", salarySlipDetails);

// Update Salary Slip Details
router.put("/:salarySlipId", updateSalarySlip);

// Delete Salary Slip
router.delete("/:salarySlipId", deleteSalarySlip);

// Update Salary Slip Status
router.post("/status", updateSalarySlipStatus);



export default router;
