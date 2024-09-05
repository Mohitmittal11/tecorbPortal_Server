import mongoose from "mongoose";
import EmployeeModal from "../../models/admin/employee.modal.js";
import jwt from "jsonwebtoken";
import TokenModal from "../../models/token.modal.js";
import Employee from "../../models/admin/employee.modal.js";


const checkingId = async (identifier) => {
    try {
        let checked;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            checked = await EmployeeModal.findById(identifier);
        }
        if (!checked) {
            return false;
        }
        return true;
    } catch (error) {
        console.error(error, "error");
        return false;
    }
};

// Employee Login
export const employeeLogin = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const employee = await EmployeeModal.findOne({ "personalInfo.employeeOfficeEmail": email });
        if (!employee) {
            return res.status(400).json({
                message: "Employee not found",
            });
        }

        if (employee.personalInfo.password !== password) {
            return res.status(400).json({
                message: "Invalid password",
            });
        }

        if (role !== "employee") {
            return res.status(400).json({
                message: "Role is required",
            });
        }

        await TokenModal.deleteMany({ userId: employee._id });

        const token = jwt.sign(
            { data: employee._id, role: employee.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24H" }
        );

        const employeeToken = new TokenModal({ token, userId: employee._id });
        await employeeToken.save();

        res.status(200).json({

            code: 200,
            message: "Login Successfully!",
            serviceToken: token,
            employee: {
                email: employee.personalInfo.employeeOfficeEmail,
                role: role,
                id: employee._id,
            },
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Employee Logout
export const employeeLogout = async (req, res) => {
    try {
        let token = req?.headers["x-auth"];
        token = token.substring(7)

        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!token) {
            return res.status(400).json({ message: "Token not provided" });
        }
        const deletedToken = await TokenModal.deleteMany({ userId: verified?.data });

        if (deletedToken) {
            return res.status(200).json({ code: 200, message: "Logout successful" });
        } else {
            return res.status(401).json({ code: 401, message: "Invalid token" });
        }
    } catch (err) {
        console.error(err.message, "error");
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Employee Detail
export const getEmployeeDetailsByToken = async (req, res) => {
    try {
        const token = req?.headers["x-auth"];
        const altToken = token.substring(7)

        const decodedToken = jwt.verify(altToken, process.env.JWT_SECRET_KEY);
        // console.log(decodedToken, "decodedToken");

        const employeeId = decodedToken.data;
        // console.log(employeeId, "employeeId");
        const checkDetails = await EmployeeModal.findOne({ _id: employeeId });

        if (!checkDetails) {
            return res.status(400).json({
                code: 400,
                message: "Employee details not found.",
            });
        }

        res.status(200).json({
            message: "Employee Details",
            code: 200,
            employee: checkDetails,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

// Employee List
export const employeeList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const pageSize = parseInt(req.query.pageSize) || 10; // Default page size to 10 if not provided

        const skip = (page - 1) * pageSize;
        const items = await Employee.find().skip(skip).limit(pageSize);
        const totalCount = await Employee.countDocuments();
        const simplifiedEmployees = items.map(employee => ({
            employeeName: employee.personalInfo.employeeName,
            employeeId: employee.personalInfo.employeeId,
            designation: employee.personalInfo.designation,
            companyDepartment: employee.personalInfo.companyDepartment,
            employeeOfficeEmail: employee.personalInfo.employeeOfficeEmail,
            employeePhone: employee.personalInfo.employeePhone,
            employeeImage: employee.personalInfo.employeeImage,
        }));
        res.status(200).json({
            message: "Employees List",
            code: 200,
            employee: simplifiedEmployees,
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

// Employee Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const token = req?.headers["x-auth"];
        const altToken = token.substring(7)

        const decodedToken = jwt.verify(altToken, process.env.JWT_SECRET_KEY);
        const employeeId = decodedToken.data;
        const employee = await EmployeeModal.findOne({ _id: employeeId });
        if (!employee) {
            return res.status(400).json({
                code: 400,
                message: "Employee not found.",
            });
        }
        // console.log(employee.personalInfo.password, currentPassword, "password");
        if (employee.personalInfo.password !== currentPassword) {
            return res.status(400).json({
                code: 400,
                message: "Current password is incorrect.",
            });
        }
        employee.personalInfo.password = newPassword;
        await employee.save();

        res.status(200).json({
            code: 200,
            message: "Password updated successfully.",
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};