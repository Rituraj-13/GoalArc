import express from "express";
import Todo from "../models/Todo.js";
import Streak from "../models/Streak.js";
import AuthMiddleware from "../Middlewares/AuthMiddleware.js";
import { updateLeaderboardEntry } from "../services/leaderboardService.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.use(AuthMiddleware);

const isSameDay = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

const isConsecutiveDay = (date1, date2) => {
    const dayDiff = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
    return dayDiff === 1;
}

// Streak route 
router.get('/streak', async (req, res) => {
    try {
        let streak = await Streak.findOne({ user: req.userId });
        if (!streak) {
            streak = new Streak({ user: req.userId });
            await streak.save();
        }
        res.json(streak);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Streak !' });
    }
})

router.get('/check-streak', async (req, res) => {
    try {
        const streak = await Streak.findOne({ user: req.userId });
        if (!streak) {
            return res.status(404).json({ message: 'Streak not found' });
        }

        const userTimeZone = streak.timezone;
        const now = new Date().toLocaleString('en-US', { timeZone: userTimeZone });
        const lastDate = streak.lastCompletionDate ?
            new Date(streak.lastCompletionDate).toLocaleString('en-US', { timeZone: userTimeZone }) : null;

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

        // Update leaderboard on streak update
        await updateLeaderboardEntry(req.userId);

        res.json({ message: "Streak Updated Successfully" });
    } catch (error) {
        console.error('Streak check error:', error);
        res.status(500).json({ message: 'Failed to check streak' });
    }
});

// Get all todos for a logged in user
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.userId });
        res.json(todos);
    } catch (error) {
        res.status(500).json({
            msg: "Error fetching Todos !"
        })
    }
})

// Create a new todo
router.post('/', async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const todo = new Todo({
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : null,
            user: req.userId,
            completed: false
        });

        const savedTodo = await todo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(500).json({ error: 'Error creating todo' });
    }
});

// Update todo
router.put('/:id', async (req, res) => {
    try {
        const { title, description, completed, dueDate } = req.body;
        const todoId = req.params.id;

        const todo = await Todo.findOne({ _id: todoId, user: req.userId });

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Handle streak logic when completion status changes
        if (completed !== undefined && completed !== todo.completed && completed) {
            let streak = await Streak.findOne({ user: req.userId });
            if (!streak) {
                streak = new Streak({
                    user: req.userId,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
            }

            const now = new Date();
            const userNow = new Date(now.toLocaleString('en-US', { timeZone: streak.timezone }));
            const startOfToday = new Date(userNow.setHours(0, 0, 0, 0));

            if (!streak.lastCompletionDate) {
                streak.currentStreak = 1;
            } else {
                const lastDate = new Date(streak.lastCompletionDate);
                const userLastDate = new Date(lastDate.toLocaleString('en-US', { timeZone: streak.timezone }));
                const startOfLastDate = new Date(userLastDate.setHours(0, 0, 0, 0));

                const daysDifference = Math.floor((startOfToday - startOfLastDate) / (1000 * 60 * 60 * 24));

                if (daysDifference === 0) {
                    // Same day, keep streak
                } else if (daysDifference === 1) {
                    streak.currentStreak += 1;
                } else {
                    streak.currentStreak = 1; // Reset to 1 for new streak
                }
            }

            streak.lastCompletionDate = now;
            streak.highestStreak = Math.max(streak.currentStreak, streak.highestStreak);
            await streak.save();

            // Update leaderboard entry after streak update
            await updateLeaderboardEntry(req.userId);
        }

        // Update todo fields
        if (title) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (dueDate !== undefined) todo.dueDate = dueDate;
        if (completed !== undefined) todo.completed = completed;

        const updatedTodo = await todo.save();

        // Return streak info if completion status changed
        if (completed !== undefined && completed !== todo.completed) {
            const streak = await Streak.findOne({ user: req.userId });
            if (streak.currentStreak > 0 && streak.currentStreak % 7 === 0) {
                // Week milestone reached
                return res.json({
                    todo: updatedTodo,
                    streak,
                    milestone: {
                        type: 'week',
                        count: Math.floor(streak.currentStreak / 7)
                    }
                });
            }
            return res.json({ todo: updatedTodo, streak });
        }

        res.json({ todo: updatedTodo });
    } catch (error) {
        res.status(500).json({ error: 'Error updating todo' });
    }
});

// Delete todo
router.delete('/:id', async (req, res) => {
    try {
        const todoId = req.params.id;
        const todo = await Todo.findOneAndDelete({
            _id: todoId,
            user: req.userId  // Fixed to match schema and middleware
        });

        if (!todo) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting Task' });
    }
});

// Add to backend/routes/todo.js
router.post('/generate-description', async (req, res) => {
    try {
        const { title } = req.body;
        const structure = "```markdown...response...```"
        const API_Key = process.env.VITE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(API_Key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Create a small concise description in a proper markdown format for a Task that has a title - ${title}
    Note -
    1 - Do not give any option & have 3 points
    2 - Do not have any formatting for checkboxes
    3 - The Generated response should not have a title similar to the provided one
    4 - Every response should have this strucure - ${structure}`;

        const result = await model.generateContent(prompt);
        const description = await result.response.text();

        res.json({ description });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate description' });
    }
});

export default router;