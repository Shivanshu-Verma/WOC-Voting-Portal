import { v2 } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.utils.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "voter-images",
        allowed_formats: ["jpeg", "png", "jpg"],
    },
});

const upload = multer({ storage });

export default upload;
