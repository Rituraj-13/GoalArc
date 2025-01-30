import Streak from "../models/Streak.js";

export default async function streakCheck (req, res, next){
    try {
        if (!req.user) {
            return next();
        }

        const streak = await Streak.findOne({ user: req.user.id });
        if (streak) {
            const now = new Date().toLocaleString('en-US', { timeZone: streak.timezone });
            const lastDate = streak.lastCompletionDate ? 
                new Date(streak.lastCompletionDate).toLocaleString('en-US', { timeZone: streak.timezone }) : null;

            if (lastDate) {
                const daysSinceLastCompletion = Math.floor(
                    (new Date(now) - new Date(lastDate)) / (1000 * 60 * 60 * 24)
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
