// =========================================================
// THE PAPER NEST — BACKEND SERVER
// =========================================================

const path = require("path");

// Load .env from the project root
require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/taskroutes");
const subjectRoutes = require("./routes/subjectroutes");

const app = express();

const PORT = process.env.PORT || 5000;

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================
// FRONTEND ROUTES
// IMPORTANT: "/" MUST COME BEFORE express.static()
// =========================================================

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "login.html")
    );
});

app.get("/signup", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "signup.html")
    );
});
app.get("/forgot-password", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "forgot-password.html")
    );
});
app.get("/dashboard", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "dashboard.html")
    );
});

// =========================================================
// STATIC FRONTEND FILES
// =========================================================

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

// =========================================================
// API ROUTES
// =========================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/tasks",
    taskRoutes
);

app.use(
    "/api/subjects",
    subjectRoutes
);

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "The Paper Nest server is running"
    });
});

// =========================================================
// MONGODB CONNECTION
// =========================================================

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
    console.error(
        "ERROR: MONGODB_URI is not set."
    );
    process.exit(1);
}

console.log(
    "Connecting to MongoDB..."
);

mongoose
    .connect(mongoURI)
    .then(() => {
        console.log(
            "MongoDB CONNECTED SUCCESSFULLY!"
        );

        app.listen(
            PORT,
            "0.0.0.0",
            () => {
                console.log(
                    `The Paper Nest server is running on port ${PORT}`
                );
            }
        );
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error
        );

        process.exit(1);
    });

// =========================================================
// ERROR HANDLING
// =========================================================

app.use(
    (err, req, res, next) => {
        console.error(
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
);