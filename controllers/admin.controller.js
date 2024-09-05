import jwt from "jsonwebtoken";
import Admin from "../models/admin.modal.js";
import TokenModal from "../models/token.modal.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const admin = await Admin.findOne({ email }).select("email password role id");

    if (!admin)
      return res.status(400).json({
        message: "Admin not found",
      });

    if (!admin.validPassword(password))
      return res.status(400).json({
        message: "Wrong password",
      });

    if (role !== "admin") {
      return res.status(400).json({
        message: "Wrong Credential",
      });
    }

    await TokenModal.deleteMany({ userId: admin._id });
    const token = jwt.sign(
      { data: admin._id, role: admin.role },
      `${process.env.JWT_SECRET_KEY}`,
      { expiresIn: "24H" }
    );

    const adminToken = new TokenModal({ token, userId: admin._id });
    await adminToken.save();

    res.status(200).json({
      code: 200,
      message: "Login Successfully! ",
      serviceToken: token,
      admin: {
        email,
        role: admin.role,
        id: admin._id,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminLogout = async (req, res) => {
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

export const adminRegister = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const checkAdmin = await Admin.findOne({ email }).select("email role id");
    if (checkAdmin)
      return res.status(400).json({
        message: "email already used",
      });

    if (role !== "admin") {
      return res.status(400).json({
        message: "Wrong Credential",
      });
    }
    const admin = new Admin({ email, role });
    admin.setPassword(password);
    await admin.save();
    res.status(201).json({
      message: "Admin created Successfully",
      code: 201,
      email: admin.email,
      role: admin.role,
      id: admin._id,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const tokeVerify = async (req, res) => {
  try {
    let _id = req.admin._id;
    const checkAdmin = await Admin.findOne({ _id }).select("email role id");

    if (!checkAdmin) {
      return res.status(400).json({
        message: "Admin not exist.",
      });
    }
    res.status(200).json({
      message: "Admin Details",
      code: 200,
      admin: checkAdmin,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
