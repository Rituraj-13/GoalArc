import mongoose from "mongoose";
const todoSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: {
        type: Date,
        required: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCreds',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Todo', todoSchema);