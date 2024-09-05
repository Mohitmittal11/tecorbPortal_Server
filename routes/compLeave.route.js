import express from "express";
import { addCompLeaves, compLeavesList, compLeavesDetails, updateCompLeavesStatus, deleteCompLeaves, updateCompLeaves, } from "../controllers/compLeave.controller.js";
import { adminTokenAuth } from "../middlewares/adminToken.middleware.js";

const router = express.Router();

// Add compensate leave
router.post("/add", adminTokenAuth, addCompLeaves);

// Compensate leave list
router.get("/", adminTokenAuth, compLeavesList);

// Get Leaves  Details
router.get("/detail/:leavesId", adminTokenAuth, compLeavesDetails);

// Update Leaves  Details
router.put("/:leavesId", adminTokenAuth, updateCompLeaves);

// Delete Leaves 
router.delete("/:leavesId", adminTokenAuth, deleteCompLeaves);

// Update Leaves  Status
router.post("/status", adminTokenAuth, updateCompLeavesStatus);


// Approve leave list
// router.get("/approve-list", approveCompList)

export default router;