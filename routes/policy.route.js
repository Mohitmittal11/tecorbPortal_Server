import express from "express";
import {
  addPolicyData,
  getPolicyData,
} from "../controllers/policy.controller.js";
import { adminTokenAuth } from "../middlewares/adminToken.middleware.js";

const router = express.Router();

router.post("/addpolicy", adminTokenAuth, addPolicyData);
router.get("/getPolicyData",  getPolicyData);
export default router;
