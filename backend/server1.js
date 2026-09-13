require("dotenv").config({
    path: require("path").join(__dirname, "..", ".env")
});
console.log("JWT SECRET LOADED:", !!process.env.JWT_SECRET);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const path = require("path");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/taskroutes");
const subjectRoutes = require("./routes/subjectroutes");


const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subjects", subjectRoutes);
// ===============================
// SERVE FRONTEND FILES
// ===============================

// Frontend files are one folder above backend
app.use(express.static(path.join(__dirname, "..")));

// ===============================
// MONGODB CONNECTION
// ===============================

const mongoURI =
    "mongodb://manideka2011_db_user:RjAzcFUSQ5am5RvR@ac-dbddmoc-shard-00-00.4arbric.mongodb.net:27017,ac-dbddmoc-shard-00-01.4arbric.mongodb.net:27017,ac-dbddmoc-shard-00-02.4arbric.mongodb.net:27017/?ssl=true&replicaSet=atlas-fzbu96-shard-0&authSource=admin&appName=dailyplanner";

console.log("Connecting to MongoDB...");

mongoose
    .connect(mongoURI)
    .then(() => {
        console.log("MongoDB CONNECTED SUCCESSFULLY!");

        app.listen(PORT, () => {
            console.log(
                `The Paper Nest server is running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error);
    });


// ===============================
// FRONTEND ROUTES
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dashboard.html"));
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    });
});

// ===============================
// ERROR HANDLING
// ===============================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});