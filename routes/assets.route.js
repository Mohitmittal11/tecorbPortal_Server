import express from "express";
import { addAssets, assetAssign, assetDetails, assetRemove, assetsList, deleteAssets, updateAsset } from "../controllers/assets.controller.js";
import { adminTokenAuth } from "../middlewares/adminToken.middleware.js";


const router = express.Router();

// Assets list
router.get("/", adminTokenAuth, assetsList)

// Add Assets
router.post("/add", adminTokenAuth, addAssets)

//Assign Assets
router.post("/assign", adminTokenAuth, assetAssign)

//Assets Detail
router.get("/detail/:Id", adminTokenAuth, assetDetails)

// Asset Update 
router.put("/update/:Id", adminTokenAuth, updateAsset)

// Assets delete
router.delete("/delete/:Id", adminTokenAuth, deleteAssets)

// Remove Assign Assets
router.put("/remove-assign/:assetId", adminTokenAuth, assetRemove)

export default router;