import mongoose from "mongoose";
import { updateLeaderboardEntry } from "../services/leaderboardService.js";

const streakSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCreds',
        required: true
    },
    currentStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastCompletionDate: {
        type: Date,
        default: null
    },
    highestStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastUpdatedDay: {
        type: Date,
        default: null
    },
    timezone: {
        type: String,
        default: 'UTC'
    }
})

streakSchema.pre('save', function (next) {
    if (this.currentStreak > this.highestStreak) {
        this.highestStreak = this.currentStreak;
    }
    next();
});

// Add post-save hook to update leaderboard
streakSchema.post('save', async function () {
    try {
        console.log(`Streak saved for user ${this.user}, updating leaderboard`);
        await updateLeaderboardEntry(this.user);
    } catch (error) {
        console.error('Error updating leaderboard after streak save:', error);
    }
});

export default mongoose.model('Streak', streakSchema);