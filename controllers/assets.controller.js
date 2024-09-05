import mongoose from "mongoose";
import EmployeeModal from "../models/admin/employee.modal.js";
import AssetsModal from "../models/assets.modal.js";


export const checkingId = async (identifier) => {
    try {
        let checked;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            checked = await AssetsModal.findById(identifier);
        }
        if (!checked) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error occurred while checking assets:", error);
        return false;
    }
};

// Add Assets 
export const addAssets = async (req, res) => {
    try {
        const reqBody = req.body
        const { serialNo, assetId } = reqBody
        const checkAssets = await AssetsModal.findOne({ serialNo: serialNo, assetId: assetId })
        if (checkAssets) {
            return res.status(400).json({
                code: 400,
                message: "Asset already exists.",
            });
        }

        const asset = new AssetsModal(reqBody);
        await asset.save();
        res.status(201).json({
            code: 201,
            message: "Asset added successfully",
            asset: asset,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// Assets List 
export const assetsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        let search = req.query.search;

        let query = AssetsModal.find();
        if (search) {
            query = query.or([
                { type: { $regex: search, $options: "i" } },
            ]);
        }

        const skip = (page - 1) * pageSize;
        const items = await query.skip(skip).limit(pageSize);
        const totalCount = await AssetsModal.countDocuments(query);

        res.status(200).json({
            message: "Assets List",
            code: 200,
            assets: items,
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

// Assets Assign
export const assetAssign = async (req, res) => {
    try {
        const { assignTo, assetIds, assignDate, assignBy, employeeName, description } = req.body;

        if (!assignTo) {
            return res.status(400).json({
                code: 400,
                message: "AssignTo field is required.",
            });
        }
        if (!assignDate) {
            return res.status(400).json({
                code: 400,
                message: "Assign Date is required.",
            });
        }
        if (!assignBy) {
            return res.status(400).json({
                code: 400,
                message: "Assign By is required.",
            });
        }
        if (!description) {
            return res.status(400).json({
                code: 400,
                message: "Description is required.",
            });
        }
        if (!Array.isArray(assetIds) || assetIds.length === 0) {
            return res.status(400).json({
                code: 400,
                message: "AssetIds field should be a non-empty array.",
            });
        }

        const [day, month, year] = assignDate.split('/');
        const parsedAssignDate = new Date(`${year}-${month}-${day}`);
        if (isNaN(parsedAssignDate)) {
            return res.status(400).json({
                code: 400,
                message: "Invalid assign date format. Use DD/MM/YYYY.",
            });
        }

        // Check employee
        const employee = await EmployeeModal.findOne({ _id: assignTo });
        if (!employee) {
            return res.status(400).json({
                code: 400,
                message: "AssignTo employee does not exist.",
            });
        }

        let assignedAssets = [];

        for (let assetId of assetIds) {
            const asset = await AssetsModal.findOne({ _id: assetId });

            if (!asset) {
                return res.status(400).json({
                    code: 400,
                    message: `Asset does not exist.`,
                });
            }

            if (asset.isAssign) {
                return res.status(400).json({
                    code: 400,
                    message: `Asset is already assigned.`,
                });
            }

            await AssetsModal.updateOne({ _id: assetId }, { $set: { assignTo, isAssign: true, employeeName } });
            assignedAssets.push({
                uId: asset._id,
                name: asset.name,
                type: asset.type,
                assignDate: parsedAssignDate,
                assignBy: assignBy,
                description,
            });
        }

        // Update employee assets
        employee.assetsInfo = employee.assetsInfo.concat(assignedAssets);
        await employee.save();

        res.status(200).json({
            message: "Assets assigned successfully",
            code: 200,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// Delete Assets
export const deleteAssets = async (req, res) => {
    try {
        let _id = req.params?.Id;

        const checkSeetExist = await checkingId(_id);
        if (!checkSeetExist) {
            return res.status(400).json({
                code: 400,
                message: "Asset does not exist.",
            });
        }

        // Find the asset
        const asset = await AssetsModal.findById(_id);
        if (!asset) {
            return res.status(404).json({
                code: 404,
                message: "Asset not found.",
            });
        }

        if (asset.isAssign && asset.assignTo) {
            const employee = await EmployeeModal.findById(asset.assignTo);
            if (employee) {
                employee.assetsInfo = employee.assetsInfo.filter(
                    (assignedAsset) => assignedAsset.uId.toString() !== _id
                );
                await employee.save();
            }
        }

        await AssetsModal.deleteOne({ _id });

        res.status(200).json({
            message: "Asset deleted successfully",
            code: 200,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Assets Detail
export const assetDetails = async (req, res) => {
    try {

        let _id = req.params?.Id;

        const checkAssetExist = await checkingId(_id);
        if (!checkAssetExist) {
            return res.status(400).json({
                code: 400,
                message: "Asset not exist.",
            });
        }
        const checkDetails = await AssetsModal.findOne({ _id });

        res.status(201).json({
            message: "Asset Details",
            code: 200,
            asset: checkDetails,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Update Asset
export const updateAsset = async (req, res) => {
    try {
        const assetId = req.params.Id;
        const updateData = req.body;

        // Check Asset
        const asset = await AssetsModal.findById(assetId);
        if (!asset) {
            return res.status(404).json({
                code: 404,
                message: "Asset not found.",
            });
        }

        Object.assign(asset, updateData);

        // Save the updated asset
        await asset.save();

        res.status(200).json({
            code: 200,
            message: "Asset updated successfully",
            asset: asset,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Remove assets assign to the employee 
export const assetRemove = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const { assetId } = req.params;

        if (!employeeId) {
            return res.status(400).json({
                code: 400,
                message: "EmployeeId field is required.",
            });
        }

        if (!assetId) {
            return res.status(400).json({
                code: 400,
                message: "AssetId parameter is required.",
            });
        }

        const employee = await EmployeeModal.findOne({ _id: employeeId });
        if (!employee) {
            return res.status(400).json({
                code: 400,
                message: "Employee does not exist.",
            });
        }

        const asset = await AssetsModal.findOne({ _id: assetId });
        if (!asset) {
            return res.status(400).json({
                code: 400,
                message: "Asset does not exist.",
            });
        }

        //check assets assign to the valid employee
        if (!asset.isAssign || !asset.assignTo || asset.assignTo.toString() !== employeeId) {
            return res.status(400).json({
                code: 400,
                message: "Asset is not assigned to the specified employee.",
            });
        }

        await AssetsModal.updateOne({ _id: assetId }, { $set: { assignTo: null, isAssign: false, employeeName: null } });

        employee.assetsInfo = employee.assetsInfo.filter(asset => asset.uId.toString() !== assetId);
        await employee.save();

        res.status(200).json({
            message: "Asset removed successfully",
            code: 200,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message,
        });
    }
};