import jwt from "jsonwebtoken";
import TokenModal from "../models/token.modal.js";
import EmployeeModal from "../models/admin/employee.modal.js";

const tokenDecode = async (req) => {
    try {
        const token = req?.headers["x-auth"];
        const altToken = token.substring(7)

        const verified = jwt.verify(altToken, process.env.JWT_SECRET_KEY);
        // console.log(verified, "verified");

        let checkToken = await TokenModal.find({ userId: verified?.data })
        // console.log(checkToken, "checkToken");

        if (token && checkToken.length > 0) {
            const tokens = token.split(" ")[1];
            return jwt.verify(tokens, `${process.env.JWT_SECRET_KEY}`);
        }
        return false;
    } catch {
        return false;
    }
};

export const employeeTokenAuth = async (req, res, next) => {
    const tokenDecoded = await tokenDecode(req);
    // console.log(tokenDecoded, "tokenDecoded");

    if (!tokenDecoded) {
        return res.status(401).json({
            code: 401,
            message: "Unauthorized access",
        });
    }

    //check admin exist or not
    const employeeChecked = await EmployeeModal.findById(tokenDecoded.data);
    // console.log(employeeChecked, "employeeChecked");
    if (!employeeChecked) {
        return res.status(401).json({
            code: 401,
            message: "Unauthorized access",
        });
    }
    req.admin = employeeChecked;

    next();
};
