import mongoose from "mongoose";

const pomodoroSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCreds',
    required: true
  },
  workDuration: {
    type: Number,
    default: 25
  },
  shortBreakDuration: {
    type: Number,
    default: 5
  },
  longBreakDuration: {
    type: Number,
    default: 15
  },
  sessionsUntilLongBreak: {
    type: Number,
    default: 4
  },
  autoStartBreaks: {
    type: Boolean,
    default: false
  },
  autoStartPomodoros: {
    type: Boolean,
    default: false
  },
  notifications: {
    type: Boolean,
    default: true
  },
  soundEnabled: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('PomodoroSettings', pomodoroSettingsSchema); 