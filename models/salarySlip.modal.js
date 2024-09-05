import mongoose from "mongoose";

const slipSchema = new mongoose.Schema(
  {
    personalInfo: {
      employeeName: {
        type: String,
        required: true,
      },
      employeeCode: {
        type: String,
        required: true,
      },
      designation: {
        type: String,
        required: true,
      },
      employeeDOJ: {
        type: String,
        required: true,
      },
      companyBranch: {
        type: String,
        required: true,
      },
      companyDepartment: {
        type: String,
        required: true,
      },
    },
    attendanceInfo: {
      lwp: {
        type: String,
        required: true,
      },
      paidHolidays: {
        type: String,
        required: true,
      },
      absent: {
        type: String,
        required: true,
      },
      wfh: {
        type: String,
        required: true,
      },

      leave: {
        type: String,
        required: true,
      },
      earnedLeave: {
        type: String,
        required: true,
      },
      maternityLeave: {
        type: String,
        required: true,
      },

      monthDays: {
        type: String,
        required: true,
      },
      paidDays: {
        type: String,
        required: true,
      },
      weekOff: {
        type: String,
        required: true,
      },
      totalPresent: {
        type: String,
        required: true,
      },
    },
    earningInfo: {
      totalEarnings: {
        type: String,
        required: true,
      },
      basicSalary: {
        type: String,
        required: true,
      },
      houseRent: {
        type: String,
        required: true,
      },
      conveyance: {
        type: String,
        required: true,
      },
      special: {
        type: String,
        required: true,
      },
      medical: {
        type: String,
        required: true,
      },
      ctc: {
        type: String,
        required: true,
      },
    },
    deductionInfo: {
      tds: {
        type: String,
        required: false,
      },
      pf: {
        type: String,
        required: false,
      },
    },
    commonInfo: {
      slipMonth: {
        type: String,
        required: true,
      },
      slipYear: {
        type: String,
        required: true,
      },
      createdBy: {
        type: String,
        required: true,
      },
    },
    netPay: {
      type: String,
      required: true,
    },
    totalDeduction: {
      type: String,
      required: true,
    },
  },
  {
    timestamp: true,
  }
);

const SalarySlipModal = mongoose.model("SalarySlipModal", slipSchema);

export default SalarySlipModal;
