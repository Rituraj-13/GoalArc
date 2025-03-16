import express from "express"
import s3Client, { generatePresignedUrl } from '../config/s3Config.js';
import upload from '../Middlewares/uploadMiddleware.js';
import AuthMiddleware from "../Middlewares/AuthMiddleware.js";
import UserObject from "../auth.js"
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const router = express.Router();

// Upload profile picture router
router.post('/upload', AuthMiddleware, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file Uploaded !"
            });
        }
        // Find the user by ID (which comes from AuthMiddleware)
        const user = await UserObject.findById(req.userId);

        // If user has an existing profile picture, delete it from S3
        if (user.profilePicture) {
            const oldKey = user.profilePicture.split('/').pop();
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `profile-pictures/${oldKey}`
            }));
        }

        // Store the S3 key in the database
        const key = req.file.key;
        user.profilePicture = key;
        await user.save();

        // Generate presigned URL for immediate use
        const presignedUrl = await generatePresignedUrl(key);


        res.json({
            message: "Profile Picture uploaded Successfully",
            profilePicture: presignedUrl
        })

    } catch (error) {
        console.error("Upload Error", error);
        res.status(500).json({
            message: "Error Uploading Profile Picture"
        });
    }
});

export default router;