const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "daily-planner-secret-key-2026";

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication token is required" });
    }

    try {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        username: user.username || "",
        email: user.email,
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        profilePic: user.profilePic || ""
    };
}

router.get("/", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user: publicUser(user) });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ success: false, message: "Failed to load profile" });
    }
});

router.put("/", authenticate, async (req, res) => {
    try {
        const { name, username, bio, phone, location, profilePic } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        let cleanUsername = "";
        if (username !== undefined && String(username).trim()) {
            cleanUsername = String(username).trim().toLowerCase();
            if (!/^[a-z0-9._]{3,30}$/.test(cleanUsername)) {
                return res.status(400).json({
                    success: false,
                    message: "Username must be 3–30 characters and use only letters, numbers, dots or underscores"
                });
            }

            const existing = await User.findOne({
                username: cleanUsername,
                _id: { $ne: req.userId }
            });
            if (existing) {
                return res.status(409).json({ success: false, message: "That username is already taken" });
            }
        }

        if (profilePic && String(profilePic).length > 3_000_000) {
            return res.status(413).json({ success: false, message: "Profile picture is too large" });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                name: String(name).trim(),
                username: cleanUsername || undefined,
                bio: String(bio || "").trim().slice(0, 300),
                phone: String(phone || "").trim().slice(0, 30),
                location: String(location || "").trim().slice(0, 100),
                profilePic: profilePic || ""
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "Profile updated successfully", user: publicUser(user) });
    } catch (error) {
        console.error("Update profile error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "That username is already taken" });
        }
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
});

router.put("/password", authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new passwords are required" });
        }
        if (String(newPassword).length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const correct = await bcrypt.compare(currentPassword, user.password);
        if (!correct) return res.status(401).json({ success: false, message: "Current password is incorrect" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Failed to change password" });
    }
});

module.exports = router;
