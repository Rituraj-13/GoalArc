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
        const todo = new Todo({
            title: req.body.title,
            description: req.body.description,
            user: req.userId
        });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({
            msg: "Error creating Todo !"
        })
    }
})

export default router;