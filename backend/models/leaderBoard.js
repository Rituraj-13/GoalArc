import mongoose from "mongoose";

const leaderBoardSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCreds',
        required: true,
        unique: true
    },
    email: {
        type: String,
        ref: 'userCreds',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    currentStreak: {
        type: Number,
        ref: 'Streak',
        required: true
    },
    highestStreak: {
        type: Number,
        ref: 'Streak',
        required: true
    },
    totalDuration: {
        type: Number,
        ref: 'PomodoroSession',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    lastUpdated: {  // Add this to track when the entry was last updated
        type: Date,
        default: Date.now
    }
})

// Add these after your schema definition
leaderBoardSchema.index({ score: -1 });  // For sorting by score
leaderBoardSchema.index({ currentStreak: -1 });  // For sorting by streak

// Consolidated pre-save hook for all data updates
leaderBoardSchema.pre('save', async function (next) {
    try {
        console.log(`Running consolidated pre-save hook for user: ${this.user}`);

        // 1. Get user data
        const userDoc = await this.model('userCreds').findById(this.user);
        if (userDoc) {
            this.username = `${userDoc.firstName} ${userDoc.lastName}`.trim();
            this.email = userDoc.username;
            this.profilePicture = userDoc.profilePicture;
            console.log(`Updated user data: ${this.username}, ${this.email}`);
        }

        // 2. Get streak data
        const streakProfile = await this.model('Streak').findOne({ user: this.user });
        if (streakProfile) {
            this.currentStreak = streakProfile.currentStreak;
            this.highestStreak = streakProfile.highestStreak;
            console.log(`Updated streak data: current=${this.currentStreak}, highest=${this.highestStreak}`);
        } else {
            this.currentStreak = 0;
            this.highestStreak = 0;
            console.log('No streak profile found, using defaults');
        }

        // 3. Get Pomodoro data - only consider 'work' type sessions
        const pomodoroSessions = await this.model('PomodoroSession').find({
            user: this.user,
            completed: true,
            type: 'work'  // Only count work sessions, not breaks
        });

        console.log(`Found ${pomodoroSessions.length} completed work Pomodoro sessions`);

        // Log each session for debugging
        pomodoroSessions.forEach((session, index) => {
            console.log(`Session ${index + 1}: duration=${session.duration}, startTime=${session.startTime}, endTime=${session.endTime}`);
        });

        // Calculate total duration in minutes (convert from seconds if needed)
        const oldTotalDuration = this.totalDuration;

        // Sum up all durations from completed sessions
        let totalDurationInSeconds = 0;
        pomodoroSessions.forEach(session => {
            // Make sure we're adding a valid number
            if (session.duration && typeof session.duration === 'number') {
                totalDurationInSeconds += session.duration;
            }
        });

        // Convert to minutes for the score calculation
        const totalDurationInMinutes = Math.round(totalDurationInSeconds / 60);
        this.totalDuration = totalDurationInMinutes;

        console.log(`Total duration in seconds: ${totalDurationInSeconds}`);
        console.log(`Total duration in minutes: ${totalDurationInMinutes}`);
        console.log(`Total duration updated: ${oldTotalDuration} → ${this.totalDuration} minutes`);

        // 4. Calculate score
        const oldScore = this.score;

        // Calculate score components
        const durationScore = this.totalDuration * 40;
        const currentStreakScore = this.currentStreak * 40;
        const highestStreakScore = this.highestStreak * 20;

        // Calculate total score
        this.score = durationScore + currentStreakScore + highestStreakScore;

        console.log(`Score updated: ${oldScore} → ${this.score}`);
        console.log(`Score components: duration=${durationScore}, currentStreak=${currentStreakScore}, highestStreak=${highestStreakScore}`);

        // 5. Update timestamp
        this.lastUpdated = new Date();

        next();
    } catch (error) {
        console.error('Error in pre-save hook:', error);
        next(error);
    }
});

// Add this before the model export
leaderBoardSchema.methods.updateStats = async function () {
    console.log('updateStats method called - this is now deprecated');
    this.lastUpdated = new Date();
    await this.save();  // This will trigger all pre-save middlewares
};

export default mongoose.model('leaderBoard', leaderBoardSchema);