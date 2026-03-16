import mongoose from "mongoose";
import { updateLeaderboardEntry } from "../services/leaderboardService.js";

const pomodoroSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCreds',
        required: true
    },
    todo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo',
        required: false
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: false
    },
    duration: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['work', 'shortBreak'],
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add post-save hook to update leaderboard when a session is completed
pomodoroSessionSchema.post('save', async function () {
    try {
        // Only update leaderboard if the session is completed and is a work session
        if (this.completed && this.type === 'work') {
            console.log(`Completed work session saved for user ${this.user}, updating leaderboard`);
            await updateLeaderboardEntry(this.user);
        }
    } catch (error) {
        console.error('Error updating leaderboard after session save:', error);
    }
});

export default mongoose.model('PomodoroSession', pomodoroSessionSchema); 