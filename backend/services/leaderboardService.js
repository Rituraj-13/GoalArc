import leaderBoard from "../models/leaderBoard.js";
import mongoose from "mongoose";

export const updateLeaderboardEntry = async (userId) => {
    try {
        console.log(`Updating leaderboard for user: ${userId}`);

        // Find LeaderBoard's Entry
        let entry = await leaderBoard.findOne({ user: userId });
        console.log(`Found existing entry: ${entry ? 'Yes' : 'No'}`);

        // If no entry exists, create one
        if (!entry) {
            console.log('Creating new leaderboard entry');
            entry = new leaderBoard({
                user: userId,
                currentStreak: 0,
                highestStreak: 0,
                totalDuration: 0,
                score: 0
            });
        }

        // Get current values before save
        const beforeSave = {
            currentStreak: entry.currentStreak,
            highestStreak: entry.highestStreak,
            totalDuration: entry.totalDuration,
            score: entry.score
        };

        // Save to trigger pre-save hooks
        await entry.save();

        // Log changes
        console.log('Leaderboard entry updated:');
        console.log(`- Current Streak: ${beforeSave.currentStreak} → ${entry.currentStreak}`);
        console.log(`- Highest Streak: ${beforeSave.highestStreak} → ${entry.highestStreak}`);
        console.log(`- Total Duration: ${beforeSave.totalDuration} → ${entry.totalDuration}`);
        console.log(`- Score: ${beforeSave.score} → ${entry.score}`);

        return entry;
    } catch (error) {
        console.log('Error updating leaderboard: ', error);
        throw error;
    }
}

export const updateAllLeaderboardEntries = async () => {
    try {
        // Get all users
        const users = await mongoose.model('userCreds').find({});

        // Update leaderBoard for each user
        for (const user of users) {
            await updateLeaderboardEntry(user._id);
        }
        console.log(`Updated leaderBoard for ${users.length} users`)
    } catch (error) {
        console.log('Error updating all leaderboard entries: ', error);
        throw error;
    }
}