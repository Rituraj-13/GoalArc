import express from "express";
import { generatePresignedUrl } from "../config/s3Config.js";
import leaderBoard from "../models/leaderBoard.js";
import AuthMiddleware from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
    try {
        // getting the leaderboard entries in sorted order (score)
        const leaderboardEntries = await leaderBoard.find().sort({ score: -1 }).limit(10);

        const leaderboardWithUrls = await Promise.all(
            leaderboardEntries.map(async (entry) => {
                let profilePictureUrl = null;
                if (entry.profilePicture) {
                    profilePictureUrl = await generatePresignedUrl(entry.profilePicture);
                }
                return {
                    ...entry.toObject(),
                    profilePicture: profilePictureUrl
                };
            })
        );
        res.json(leaderboardWithUrls)
    } catch (error) {
        console.error('Error Fetching LeaderBoard: ', error);
        res.status(500).json({ message: "Error fetching Leaderboard" });
    }
});

router.get('/my-rank', AuthMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        // Get all users sorted by Score
        const allUsers = await leaderBoard.find().sort({ score: -1 });

        // find my position
        const userIndex = allUsers.findIndex(user => user.user.toString() === userId);

        if (userIndex === -1) {
            return res.status(404).json({
                message: "User not found in LeaderBoard"
            });
        }

        // Get the users entry 
        const userEntry = allUsers[userIndex];
        let profilePictureUrl = null;
        if (userEntry.profilePicture) {
            profilePictureUrl = await generatePresignedUrl(userEntry.profilePicture);
        }

        res.json({
            rank: userIndex + 1,
            totalUsers: allUsers.length,
            userDetails: {
                ...userEntry.toObject(),
                profilePicture: profilePictureUrl
            }
        });
    } catch (error) {
        console.error('Error fetching user rank: ', error);
        res.status(500).json({
            message: "Error fetching user rank"
        });
    }
});

export default router;