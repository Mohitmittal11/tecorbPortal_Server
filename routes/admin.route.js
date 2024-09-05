import express from "express";
import { body } from "express-validator";
import { validate } from "../utils/validator.js";
import {
  adminLogin,
  adminLogout,
  adminRegister,
  tokeVerify,
} from "../controllers/admin.controller.js";
import { adminTokenAuth } from "../middlewares/adminToken.middleware.js";

const router = express.Router();

router.post(
  "/login",
  body("email").exists().withMessage("email is required"),
  body("password")
    .exists()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must have at least 8 characters"),
  validate,
  adminLogin
);

router.post(
  "/register",
  body("email").exists().withMessage("email is required"),
  body("password")
    .exists()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must have at least 8 characters"),
  validate,
  adminRegister
);

router.post("/logout", adminTokenAuth, adminLogout)

router.get("/token-verify", adminTokenAuth, tokeVerify);

export default router;
