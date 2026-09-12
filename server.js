const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname)));

// ==========================================
// FILE UPLOAD CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/profiles"));
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
// DATABASE SCHEMAS
// ==========================================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: null },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { 
    type: String, 
    enum: ["Study", "Work", "Personal", "Health", "Other"],
    default: "Personal"
  },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  completed: { type: Boolean, default: false },
  date: { type: Date, required: true },
  time: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

// ==========================================
// MIDDLEWARE: AUTHENTICATION
// ==========================================

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ==========================================
// AUTH ROUTES
// ==========================================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==========================================
// USER ROUTES
// ==========================================

app.get("/api/user/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
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
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.post("/api/user/profile-pic", authenticate, upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePic: filePath },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile picture updated",
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
});

// ==========================================
// TASK ROUTES
// ==========================================

app.post("/api/tasks", authenticate, async (req, res) => {
  try {
    const { title, description, category, priority, date, time } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Title and date required" });
    }

    const task = new Task({
      userId: req.userId,
      title,
      description,
      category,
      priority,
      date: new Date(date),
      time
    });

    await task.save();
    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.get("/api/tasks", authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ date: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.get("/api/tasks/:date", authenticate, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const tasks = await Task.find({
      userId: req.userId,
      date: { $gte: date, $lt: nextDay }
    }).sort({ time: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.put("/api/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const { title, description, category, priority, completed, date, time } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.userId },
      { title, description, category, priority, completed, date: new Date(date), time },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/api/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Toggle task completion
app.patch("/api/tasks/:taskId/toggle", authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json({ message: "Task toggled", task });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

// ==========================================
// STATIC FILES & DEFAULT ROUTES
// ==========================================

app.use(express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// ==========================================
// DATABASE CONNECTION & SERVER START
// ==========================================

const PORT = process.env.PORT || 8080;

console.log("Connecting to MongoDB...");
console.log("MONGODB_URI starts with:", process.env.MONGODB_URI?.substring(0, 20));

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