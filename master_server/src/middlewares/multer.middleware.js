import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "voter-images",
        allowed_formats: ["jpeg", "png", "jpg"],
    },
});

const upload = multer({ storage });

export default upload;
