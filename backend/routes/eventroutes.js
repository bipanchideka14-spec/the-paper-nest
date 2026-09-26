const express = require("express");
const jwt = require("jsonwebtoken");
const Event = require("../models/event");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "daily-planner-secret-key-2026";

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required"
        });
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

router.get("/", authenticate, async (req, res) => {
    try {
        const events = await Event.find({ userId: req.userId }).sort({ date: 1, time: 1, createdAt: 1 });
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ success: false, message: "Failed to fetch events" });
    }
});

router.post("/", authenticate, async (req, res) => {
    try {
        const { title, date, time, type, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "Event title is required" });
        }

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, message: "A valid event date is required" });
        }

        const event = await Event.create({
            title: title.trim(),
            date,
            time: time || "",
            type: type || "Personal",
            description: description || "",
            userId: req.userId
        });

        res.status(201).json(event);
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({ success: false, message: "Failed to add event" });
    }
});

router.put("/:id", authenticate, async (req, res) => {
    try {
        const allowed = {};
        ["title", "date", "time", "type", "description"].forEach(key => {
            if (req.body[key] !== undefined) allowed[key] = req.body[key];
        });

        if (allowed.title !== undefined && !String(allowed.title).trim()) {
            return res.status(400).json({ success: false, message: "Event title is required" });
        }

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            allowed,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ success: false, message: "Failed to update event" });
    }
});

router.delete("/:id", authenticate, async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.userId });

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ success: false, message: "Failed to delete event" });
    }
});

module.exports = router;
