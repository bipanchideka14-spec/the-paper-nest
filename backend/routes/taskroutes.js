const express = require("express");
const Task = require("../models/task1");

const router = express.Router();


// =====================================
// GET ALL TASKS FOR LOGGED-IN USER
// =====================================

router.get("/", async (req, res) => {
    try {

        const userId = req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const tasks = await Task.find({
            userId: userId
        }).sort({
            createdAt: -1
        });

        res.json(tasks);

    } catch (error) {

        console.error("Error fetching tasks:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks"
        });
    }
});


// =====================================
// ADD TASK
// =====================================

router.post("/", async (req, res) => {
    try {

        const userId = req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const {
            title,
            time,
            subject,
            priority,
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

            date: date ||
                new Date()
                    .toISOString()
                    .split("T")[0],

            userId: userId
        });

        const savedTask =
            await task.save();

        res.status(201).json(savedTask);

    } catch (error) {

        console.error("Error adding task:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add task"
        });
    }
});


// =====================================
// UPDATE TASK / COMPLETE TASK
// =====================================

router.put("/:id", async (req, res) => {
    try {

        const userId =
            req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const updatedTask =
            await Task.findOneAndUpdate(

                {
                    _id: req.params.id,
                    userId: userId
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

        res.json(updatedTask);

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


// =====================================
// DELETE TASK
// =====================================

router.delete("/:id", async (req, res) => {
    try {

        const userId =
            req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const deletedTask =
            await Task.findOneAndDelete({

                _id: req.params.id,

                userId: userId

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