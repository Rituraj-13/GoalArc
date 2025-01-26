import express from "express";
import Todo from "../models/Todo.js";
import AuthMiddleware from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(AuthMiddleware);

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

        if (title) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (dueDate !== undefined) todo.dueDate = dueDate;
        if (completed !== undefined) todo.completed = completed;

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
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
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting todo' });
    }
});

// Add to backend/routes/todo.js
import { GoogleGenerativeAI } from "@google/generative-ai";

router.post('/generate-description', async (req, res) => {
    try {
        const { title } = req.body;
        const API_Key = process.env.VITE_AI_API_KEY; // Store in backend .env
        const genAI = new GoogleGenerativeAI(API_Key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Create a small concise description in a proper markdown format for a Task that has a title - ${title}
    Note -
    1 - Do not give any option & have 3 points
    2 - Do not have any formatting for checkboxes
    3 - The Generated response should not have a title similar to the provided one
    4 - Avoid generating response for any title `;

        const result = await model.generateContent(prompt);
        const description = await result.response.text();

        res.json({ description });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate description' });
    }
});

export default router;