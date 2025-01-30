import mongoose from "mongoose";

const streakSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCreds',
        required : true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    lastCompletionDate: {
        type: Date,
        default: null
    },
    highestStreak: {
        type: Number,
        default: 0
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

export default mongoose.model('Streak', streakSchema);