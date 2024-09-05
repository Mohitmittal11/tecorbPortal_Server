import { v2 as cloudinary } from "cloudinary";
import Multer from "multer";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = Multer.memoryStorage();
export const upload = Multer({
  storage,
});
export const handleUpload = async (file) => {
  // console.log(file, "file");
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  // console.log(res, "res");
  return res;

};

export const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      console.log("result", result);
      return resolve(result);
    });
  });
};
