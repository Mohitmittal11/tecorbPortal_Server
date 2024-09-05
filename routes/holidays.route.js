import express from "express";
import { addHoliday, deleteHoliday, holidayDetails, holidayList, updateHoliday } from "../controllers/holidays.controller.js";
import { adminTokenAuth } from "../middlewares/adminToken.middleware.js";


const router = express.Router();

// Holiday List
router.get("/", holidayList)

// Add Holiday
router.post("/add", adminTokenAuth, addHoliday)

// Holiday Detail
router.get("/detail/:Id", adminTokenAuth, holidayDetails)

// Update Holiday
router.put("/update/:Id", adminTokenAuth, updateHoliday)

// Delete Holiday
router.delete("/delete/:Id", adminTokenAuth, deleteHoliday)

export default router;