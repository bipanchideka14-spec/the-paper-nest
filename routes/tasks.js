const express = require("express");
const jwt = require("jsonwebtoken");

const Task = require("../models/task");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// ============================
// AUTH MIDDLEWARE
// ============================
function authenticate(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.userId = decoded.userId;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// ============================
// GET TASKS
// ============================
router.get("/", authenticate, async (req, res) => {

    try {

        const tasks = await Task.find({
            userId: req.userId
        }).sort({
            date: 1,
            createdAt: 1
        });

        res.json(tasks);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

// ============================
// CREATE TASK
// ============================
router.post("/", authenticate, async (req, res) => {

    try {

        const task = await Task.create({
            ...req.body,
            userId: req.userId
        });

        res.status(201).json(task);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: "Failed to create task"
        });
    }
});

// ============================
// UPDATE TASK
// ============================
router.put("/:id", authenticate, async (req, res) => {

    try {

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.userId
            },
            req.body,
            {
                new: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: "Failed to update task"
        });
    }
});

// ============================
// DELETE TASK
// ============================
router.delete("/:id", authenticate, async (req, res) => {

    try {

        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: "Failed to delete task"
        });
    }
});

module.exports = router;