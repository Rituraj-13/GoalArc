import Streak from "../models/Streak.js";

export default async function streakCheck(req, res, next) {
    try {
        if (!req.userId) {
            return next();
        }

        const streak = await Streak.findOne({ user: req.userId });
        if (streak) {
            const now = new Date();
            const lastDate = streak.lastCompletionDate;

            if (lastDate) {
                // Convert both dates to start of day in user's timezone
                const userNow = new Date(now.toLocaleString('en-US', { timeZone: streak.timezone }));
                const userLastDate = new Date(lastDate.toLocaleString('en-US', { timeZone: streak.timezone }));

                const startOfNow = new Date(userNow.setHours(0, 0, 0, 0));
                const startOfLastDate = new Date(userLastDate.setHours(0, 0, 0, 0));

                const daysSinceLastCompletion = Math.floor(
                    (startOfNow - startOfLastDate) / (1000 * 60 * 60 * 24)
                );

                if (daysSinceLastCompletion > 1) {
                    streak.currentStreak = 0;
                    streak.lastCompletionDate = null;
                    await streak.save();
                }
            }
        }
        next();
    } catch (error) {
        console.error('Streak middleware error:', error);
        next();
    }
};
