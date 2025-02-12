import mongoose from "mongoose";

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

export default mongoose.model('PomodoroSession', pomodoroSessionSchema); 