import express from 'express';
import PomodoroSettings from '../models/PomodoroSettings.js';
import PomodoroSession from '../models/PomodoroSession.js';
import Todo from '../models/Todo.js';
import AuthMiddleware from '../Middlewares/AuthMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Apply auth middleware to all routes
router.use(AuthMiddleware);

// Get user's Pomodoro settings
router.get('/settings', async (req, res) => {
    try {
        let settings = await PomodoroSettings.findOne({ user: req.userId });

        if (!settings) {
            // Create default settings if none exist
            settings = await PomodoroSettings.create({
                user: req.userId
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update Pomodoro settings
router.put('/settings', async (req, res) => {
    try {
        const {
            workDuration,
            shortBreakDuration,
            longBreakDuration,
            sessionsUntilLongBreak,
            autoStartBreaks,
            autoStartPomodoros,
            notifications,
            soundEnabled
        } = req.body;

        const settings = await PomodoroSettings.findOneAndUpdate(
            { user: req.userId },
            {
                workDuration,
                shortBreakDuration,
                longBreakDuration,
                sessionsUntilLongBreak,
                autoStartBreaks,
                autoStartPomodoros,
                notifications,
                soundEnabled
            },
            { new: true, upsert: true }
        );

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Create a new Pomodoro session
router.post('/sessions', async (req, res) => {
    try {
        const { todoId, type, duration, completed, endTime } = req.body;

        const session = await PomodoroSession.create({
            user: req.userId,
            todo: todoId,
            type,
            duration,
            completed: completed || false,
            startTime: new Date(),
            endTime: endTime || null
        }); ``

        if (todoId) {
            // Update todo with the new session
            await Todo.findByIdAndUpdate(todoId, {
                $push: { pomodoroSessions: session._id },
                $inc: { totalPomodoroSessions: 1 }
            });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Complete a Pomodoro session
router.put('/sessions/:id/complete', async (req, res) => {
    try {
        const session = await PomodoroSession.findByIdAndUpdate(
            req.params.id,
            {
                completed: true,
                endTime: new Date()
            },
            { new: true }
        );

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete session' });
    }
});

// Update the stats endpoint to handle task-specific stats
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { todoId } = req.query;

        const matchQuery = {
            user: new mongoose.Types.ObjectId(req.userId),
            completed: true,
            startTime: { $gte: today }
        };

        // Add todoId to query if it exists and is valid
        if (todoId && todoId !== 'null' && todoId !== 'undefined') {
            try {
                matchQuery.todo = new mongoose.Types.ObjectId(todoId);
            } catch (error) {
                console.error('Invalid todoId:', error);
                return res.json({
                    work: { count: 0, totalDuration: 0 },
                    shortBreak: { count: 0, totalDuration: 0 },
                    longBreak: { count: 0, totalDuration: 0 }
                });
            }
        }

        // Add logging to debug the query
        // console.log('Stats Query:', JSON.stringify(matchQuery, null, 2));

        const stats = await PomodoroSession.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalDuration: { $sum: '$duration' }
                }
            }
        ]);

        // Log the results
        // console.log('Stats Results:', JSON.stringify(stats, null, 2));

        // Create default structure for stats
        const defaultStats = {
            work: { count: 0, totalDuration: 0 },
            shortBreak: { count: 0, totalDuration: 0 },
            longBreak: { count: 0, totalDuration: 0 }
        };

        // Fill in actual values from database
        stats.forEach(stat => {
            defaultStats[stat._id] = {
                count: stat.count,
                totalDuration: stat.totalDuration
            };
        });

        res.json(defaultStats);
    } catch (error) {
        console.error('Stats endpoint error:', error);
        res.status(500).json({
            error: 'Failed to fetch statistics',
            details: error.message
        });
    }
});

// Update the sessions count endpoint
router.get('/sessions/count', async (req, res) => {
    try {
        const { type, completed, todoId } = req.query;

        const query = {
            user: new mongoose.Types.ObjectId(req.userId),
            type,
            completed: completed === 'true'
        };

        // Add todoId to query if it exists and is valid
        if (todoId && todoId !== 'null' && todoId !== 'undefined') {
            try {
                query.todo = new mongoose.Types.ObjectId(todoId);
            } catch (error) {
                console.error('Invalid todoId in count:', error);
                return res.json({ count: 0 });
            }
        }

        const count = await PomodoroSession.countDocuments(query);
        res.json({ count });
    } catch (error) {
        console.error('Sessions count error:', error);
        res.status(500).json({
            error: 'Failed to fetch session count',
            details: error.message
        });
    }
});

export default router; 