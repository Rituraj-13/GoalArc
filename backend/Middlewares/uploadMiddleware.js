// Middleware to provide where to store and with which name
// This missleware also validates the filetype and filesize before uploading
import multer from "multer";
import multerS3 from "multer-s3";
import s3Client from "../config/s3Config.js";

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        // acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname })
        },
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'profile-pictures/' + uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5mb upload image size
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

export default upload;