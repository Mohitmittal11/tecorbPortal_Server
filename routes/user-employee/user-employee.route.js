import express from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { employeeTokenAuth } from "../../middlewares/employeeToken.middleware.js";
import { validate } from "../../utils/validator.js";
import { changePassword, employeeList, employeeLogin, employeeLogout, getEmployeeDetailsByToken } from "../../controllers/employee/userEmployee.controller.js";
import { addLeaves, employeeLeave, leavesDetails, updateLeaves } from "../../controllers/employee/employeeLeave.controller.js";
import { addCompLeaves, compLeavesDetails, employeeCompLeave, updateCompLeaves } from "../../controllers/compLeave.controller.js";
// console.log(addLeaves, employeeLeave, leavesDetails, ">>>>")
const router = express.Router();

router.post(
    "/login",
    body("email").exists().withMessage("email is required"),
    body("password")
        .exists()
        .withMessage("password is required")
        .isLength({ min: 6 })
        .withMessage("password must have at least 6 characters"),
    validate,
    employeeLogin
);


// EMPLOYEE DETAIL
router.get("/details", employeeTokenAuth, getEmployeeDetailsByToken);

// LOGOUT
router.post("/logout", employeeTokenAuth, employeeLogout)

// EMPLOYEE LIST 
router.get("/employee-list", employeeTokenAuth, employeeList)

// ADD LEAVE
router.post("/add-leave", employeeTokenAuth, addLeaves)

// LEAVE DETAIL
router.get("/leave-detail/:id", employeeTokenAuth, leavesDetails);

// UPDATE LEAVE
router.put("/leaves/:leavesId", employeeTokenAuth, updateLeaves)

//EMPLOYEE LEAVE LIST
router.get("/employee-leave", employeeTokenAuth, employeeLeave)

//EMPLOYEE CHANGE PASSWORD
router.post("/change-password", employeeTokenAuth, changePassword)


// Add compensate leave
router.post("/add", employeeTokenAuth, addCompLeaves);

// Get Leaves  Details
router.get("/detail/:leavesId", employeeTokenAuth, compLeavesDetails);

// Update Leaves  Details
router.put("/:leavesId", employeeTokenAuth, updateCompLeaves);

// Employee leave list
router.get("/employee-Compleave", employeeTokenAuth, employeeCompLeave)


export default router;

