import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    personalInfo: {
      employeeName: {
        type: String,
        required: true,
      },
      employeeImage: {
        type: String,
        required: false,
      },
      remainingLeave: {
        type: Number,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      employeeId: {
        type: String,
        required: true,
      },
      employeeOfficeEmail: {
        type: String,
        required: true,
      },
      employeePersonalEmail: {
        type: String,
        required: false,
      },
      employeePhone: {
        type: String,
        required: true,
      },
      employeeDOJ: {
        type: String,
        required: true,
      },
      employeeDOB: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      designation: {
        type: String,
        required: true,
      },
      companyDepartment: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: false,
      },
    },
    assetsInfo: [
      {
        uId: {
          type: String
        },
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        assignDate: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          required: false,
        },
        assignBy: {
          type: String,
          required: false,
        },
      }
    ],
  },
  {
    timestamps: true,
  }
);

const EmployeeModal = mongoose.model("Employee", employeeSchema);
export default EmployeeModal;
