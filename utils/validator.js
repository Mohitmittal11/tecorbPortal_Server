import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
    });
  }

  next();
};

export const validateAddProgramPayload = (payload) => {
  // Check if payload is an object
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  // Check if required fields are present
  if (
    !("name" in payload) ||
    !("category" in payload) ||
    !("coding" in payload) ||
    !("status" in payload)
  ) {
    return false;
  }

  // Validate coding array
  if (!Array.isArray(payload.coding) || payload.coding.length === 0) {
    return false;
  }

  // Validate each coding object in the array
  for (let coding of payload.coding) {
    if (
      typeof coding !== "object" ||
      coding === null ||
      !coding.code ||
      !coding.langId ||
      !coding.langName
    ) {
      return false;
    }
  }

  // If all validation passes, return true
  return true;
};
