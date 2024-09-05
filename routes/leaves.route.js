import express from "express";
import {
  addLeaves,
  approveList,
  deleteLeaves,
  leavesDetails,
  leavesList,
  updateLeaves,
  updateLeavesStatus,
} from "../controllers/leaves.controller.js";
import { adminTokenAuth } from "../middlewares/adminToken.middleware.js";
const router = express.Router();

// Add Leaves
router.post("/add", addLeaves);

// Get Leaves  List
router.get("/", adminTokenAuth, leavesList);

// Get Leaves  Details
router.get("/leaveDetail/:leavesId", adminTokenAuth, leavesDetails);

// Update Leaves  Details
router.put("/:leavesId", adminTokenAuth, updateLeaves);

// Delete Leaves
router.delete("/:leavesId", adminTokenAuth, deleteLeaves);

// Update Leaves  Status
router.post("/status", adminTokenAuth, updateLeavesStatus);

// Approve leave list
router.get("/approve-list", adminTokenAuth, approveList)

export default router;
