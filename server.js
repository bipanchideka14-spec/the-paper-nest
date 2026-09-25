const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const taskRoutes = require("./backend/routes/taskroutes");
const subjectRoutes = require("./backend/routes/subjectroutes");

const User = require("./models/user");

const app = express();

// ==========================================
// MIDDLEWARE & CORS
// ==========================================

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads", "profiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded profile images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// FILE UPLOAD CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

// ==========================================
// AUTHENTICATION MIDDLEWARE FOR PROFILE
// ==========================================

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "daily-planner-secret-key-2026");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subjects", subjectRoutes);

// ==========================================
// USER PROFILE ROUTES
// ==========================================

app.get("/api/user/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

app.put("/api/user/profile", authenticate, async (req, res) => {
  try {
    const { name, bio, phone, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, phone, location },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
});

app.post("/api/user/profile-pic", authenticate, upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePic: filePath },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile picture updated",
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to upload profile picture" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "The Paper Nest server is running"
  });
});
// FRONTEND PAGE NAVIGATION ROUTES
// =================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
});

app.get(["/forgot-password", "/forgot"], (req, res) => {
    res.sendFile(path.join(__dirname, "forget.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Serve static assets
app.use(express.static(__dirname));
// Fallback error handler
app.use((err, req, res, next) => {
  console.error("Express Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// ==========================================
// DATABASE CONNECTION & SERVER START
// ==========================================

const PORT = process.env.PORT || 8080;

console.log("Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✓ MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("✗ MongoDB connection failed:", error.message);
  });