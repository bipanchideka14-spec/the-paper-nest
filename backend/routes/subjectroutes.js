const express = require("express");
const router = express.Router();

const Subject = require("../models/subjects");


// =====================================================
// GET ALL SUBJECTS FOR LOGGED-IN USER
// =====================================================

router.get("/", async (req, res) => {
    try {

        const userId = req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const subjects = await Subject.find({
            userId: userId
        }).sort({
            createdAt: 1
        });

        res.status(200).json({
            success: true,
            subjects: subjects
        });

    } catch (error) {

        console.error("Get subjects error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load subjects"
        });
    }
});


// =====================================================
// ADD NEW SUBJECT
// =====================================================

router.post("/", async (req, res) => {
    try {

        const userId = req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const { name, progress } = req.body;

        // Check subject name
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Subject name is required"
            });
        }

        // Check progress
        let subjectProgress = Number(progress);

        if (Number.isNaN(subjectProgress)) {
            subjectProgress = 0;
        }

        if (subjectProgress < 0 || subjectProgress > 100) {
            return res.status(400).json({
                success: false,
                message: "Progress must be between 0 and 100"
            });
        }

        const subject = new Subject({

            name: name.trim(),

            progress: subjectProgress,

            userId: userId

        });

        await subject.save();

        res.status(201).json({
            success: true,
            message: "Subject added successfully",
            subject: subject
        });

    } catch (error) {

        console.error("Add subject error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add subject"
        });
    }
});


// =====================================================
// UPDATE SUBJECT
// =====================================================

router.put("/:id", async (req, res) => {
    try {

        const userId = req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const { name, progress } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Subject name is required"
            });
        }

        let subjectProgress = Number(progress);

        if (Number.isNaN(subjectProgress)) {
            subjectProgress = 0;
        }

        if (subjectProgress < 0 || subjectProgress > 100) {
            return res.status(400).json({
                success: false,
                message: "Progress must be between 0 and 100"
            });
        }

        const subject = await Subject.findOneAndUpdate(

            {
                _id: req.params.id,
                userId: userId
            },

            {
                name: name.trim(),
                progress: subjectProgress
            },

            {
                new: true,
                runValidators: true
            }

        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            subject: subject
        });

    } catch (error) {

        console.error("Update subject error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update subject"
        });
    }
});


// =====================================================
// DELETE SUBJECT
// =====================================================

router.delete("/:id", async (req, res) => {
    try {

        const userId = req.headers["user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        const subject = await Subject.findOneAndDelete({

            _id: req.params.id,

            userId: userId

        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject deleted successfully"
        });

    } catch (error) {

        console.error("Delete subject error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete subject"
        });
    }
});


module.exports = router;