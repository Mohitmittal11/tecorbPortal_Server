import mongoose from "mongoose";

const assetsSchema = new mongoose.Schema({
    assetId: {
        type: String,
        required: [true, "Asset Id is reqiured"]
    },
    employeeName: {
        type: String,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    type: {
        type: String,
        required: [true, 'Asset type is required'],
    },
    Brand: {
        type: String,
        required: [true, 'Brand is required'],
    },
    isAssign: {
        type: Boolean
    },
    assignTo: {
        type: String,
    },
    comment: {
        type: String,
    },
    serialNo: {
        type: String,
        required: [true, 'Serial number is required'],
    },
    hardDisk: {
        type: String,
    },
    ram: {
        type: String,
    },
    operatingSystem: {
        type: String
    }
})

const AssetsModal = mongoose.model("Assets", assetsSchema);
export default AssetsModal;