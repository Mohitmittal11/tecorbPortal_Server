import policyModal from "../models/policy.modal.js";
import moment from "moment";

// ADD OR UPDATE POLICY
export const addPolicyData = async (req, res) => {
  try {
    let bodyData = req.body;
    console.log("Body data is ", bodyData);

    // Get current time and date with the specified UTC offset
    const time = moment().utcOffset("+05:30").format("hh:mm a");
    const date = moment().utcOffset("+05:30").format("DD MMM YYYY");

    if (bodyData) {
      bodyData = { ...bodyData, time, date };
      const existingPolicy = await policyModal.findOne(); // Find existing policy

      if (existingPolicy) {
        // Update the existing policy
        existingPolicy.policyData = bodyData.policyData;
        existingPolicy.time = bodyData.time;
        existingPolicy.date = bodyData.date;
        const updatedPolicy = await existingPolicy.save();

        res.status(200).json({
          statusCode: 200,
          message: "Policy Updated Successfully",
          data: updatedPolicy,
        });
      } else {
        // Create a new policy
        const newPolicy = await policyModal.create(bodyData);

        res.status(200).json({
          statusCode: 200,
          message: "Policy Added Successfully",
          data: newPolicy,
        });
      }
    } else {
      res.status(400).json({
        statusCode: 400,
        message: "No data provided",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET POLICY DATA
export const getPolicyData = async (req, res) => {
  try {
    const policyData = await policyModal.findOne();
    if (policyData) {
      res.status(200).json({
        statusCode: 200,
        message: "Data Retrieved Successfully",
        data: policyData,
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "No Policy Data Found",
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// import policyModal from "../models/policy.modal.js";
// import moment from "moment";

// // ADD POLICY
// export const addPolicyData = async (req, res) => {
//   try {
//     let bodyData = await req.body;
//     console.log("Body data is ", bodyData);
//     const time = moment().utcOffset("+05:30").format("hh:mm a");
//     const date = moment().utcOffset("+05:30").format("DD MMM YYYY");
//     if (bodyData) {
//       bodyData = { ...bodyData, time: time, date: date };
//       const findData = await policyModal.findOne();
//       if (findData.length > 0) {
//         await policyModal.updateOne(
//           { _id: findData[0]._id },
//           {
//             policyData: bodyData.policyData,
//             time: bodyData.time,
//             date: bodyData.date,
//           }
//         );
//         res.status(200).json({
//           statusCode: 200,
//           message: "Policy Updated Successfully",
//           data: bodyData,
//         });
//       } else {
//         const result = await policyModal.create(bodyData);
//         if (result) {
//           res.status(200).json({
//             statusCode: 200,
//             message: "Policy Add Successfully",
//             data: result,
//           });
//         }
//       }
//     }
//   } catch (err) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// };

// // GET POLICY DATA

// export const getPolicyData = async (req, res) => {
//   try {
//     const policyData = await policyModal.findOne();
//     if (policyData) {
//       res.status(200).json({
//         statusCode: 200,
//         message: "Data Get Successfully",
//         data: policyData,
//       });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }

// };
