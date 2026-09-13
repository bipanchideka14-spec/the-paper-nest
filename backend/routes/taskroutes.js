const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/task1");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;


// =========================================================
// AUTHENTICATION MIDDLEWARE
// =========================================================

function authenticate(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No authentication token"
        });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication format"
        });
    }

    const token = authHeader.substring(7);

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}


// =========================================================
// GET ALL TASKS FOR LOGGED-IN USER
// =========================================================

router.get("/", authenticate, async (req, res) => {

    try {

        const tasks = await Task.find({
            userId: req.userId
        }).sort({
            createdAt: -1
        });

        res.json(tasks);

    } catch (error) {

        console.error(
            "Error fetching tasks:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks"
        });
    }

});


// =========================================================
// ADD TASK
// =========================================================

router.post("/", authenticate, async (req, res) => {

    try {

        const {
            title,
            time,
            subject,
            priority,
            completed,
            date
        } = req.body;


        if (!title || !title.trim()) {

            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });

        }


        const task = new Task({

            title: title.trim(),

            time: time || "",

            subject: subject || "General",

            priority: priority || "Normal",

            completed: completed || false,

            date:
                date ||
                new Date()
                    .toISOString()
                    .split("T")[0],

            userId: req.userId

        });


        const savedTask =
            await task.save();


        res.status(201).json(
            savedTask
        );

    } catch (error) {

        console.error(
            "Error adding task:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to add task",
            error: error.message
        });

    }

});


// =========================================================
// UPDATE TASK / COMPLETE TASK
// =========================================================

router.put("/:id", authenticate, async (req, res) => {

    try {

        const updatedTask =
            await Task.findOneAndUpdate(

                {
                    _id: req.params.id,
                    userId: req.userId
                },

                req.body,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!updatedTask) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }


        res.json(
            updatedTask
        );

    } catch (error) {

        console.error(
            "Error updating task:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update task"
        });

    }

});


// =========================================================
// DELETE TASK
// =========================================================

router.delete("/:id", authenticate, async (req, res) => {

    try {

        const deletedTask =
            await Task.findOneAndDelete({

                _id: req.params.id,

                userId: req.userId

            });


        if (!deletedTask) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }


        res.json({

            success: true,

            message: "Task deleted successfully"

        });

    } catch (error) {

        console.error(
            "Error deleting task:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete task"
        });

    }

});


module.exports = router;