export function validateLeavesUpdate(updateData) {
    const errors = [];

    if (!updateData.employeeId) {
        errors.push("Employee ID is required.");
    }
    else if (!updateData.employeeName) {
        errors.push("Employee name is required.");
    }
    else if (!updateData.totalLeave === undefined) {
        errors.push("Total leave is required.");
    }
    else if (!updateData.leaveType) {
        errors.push("leave type is required.");
    }
    else if (!updateData.from) {
        errors.push("From date is required.");
    }
    else if (!updateData.to) {
        errors.push("To date is required.");
    }
    else if (!updateData.reason) {
        errors.push("Reason is required.");
    }
    return errors;
}