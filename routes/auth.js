// =========================================================
// THE PAPER NEST — AUTH ROUTES
// LOGIN + SIGNUP + FORGOT PASSWORD OTP + ME
// =========================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/user");
const PasswordReset = require("../models/passwordreset");

const router = express.Router();


// =========================================================
// JWT CONFIGURATION
// =========================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing from environment variables.");
}


// =========================================================
// BREVO SMTP EMAIL CONFIGURATION
// =========================================================

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


// =========================================================
// EMAIL SENDER
// =========================================================

const EMAIL_FROM = process.env.EMAIL_FROM;

if (!EMAIL_FROM) {
    console.warn("EMAIL_FROM is missing from environment variables.");
}


// =========================================================
// SEND OTP EMAIL
// =========================================================

async function sendOTPEmail(email, otp) {

    if (!process.env.SMTP_USER) {
        throw new Error("SMTP_USER is missing from environment variables.");
    }

    if (!process.env.SMTP_PASS) {
        throw new Error("SMTP_PASS is missing from environment variables.");
    }

    if (!EMAIL_FROM) {
        throw new Error("EMAIL_FROM is missing from environment variables.");
    }

    await transporter.sendMail({

        from: `"The Paper Nest" <${EMAIL_FROM}>`,

        to: email,

        subject: "The Paper Nest - Password Reset OTP",

        text:
            `Your The Paper Nest password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 40px auto;
                padding: 35px;
                background: #fffaf5;
                border-radius: 15px;
                text-align: center;
                border: 1px solid #eee7dc;
            ">

                <h1 style="
                    color: #4e3b32;
                    margin-bottom: 10px;
                ">
                    The Paper Nest
                </h1>

                <h2 style="
                    color: #4e3b32;
                ">
                    Password Reset
                </h2>

                <p style="
                    color: #555;
                    font-size: 16px;
                ">
                    Your verification code is:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    background: #eee7dc;
                    border-radius: 10px;
                    color: #4e3b32;
                ">
                    ${otp}
                </div>

                <p style="
                    color: #777;
                    font-size: 14px;
                ">
                    This OTP will expire in
                    <strong>10 minutes</strong>.
                </p>

                <p style="
                    color: #777;
                    font-size: 14px;
                ">
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>

                <p style="
                    color: #777;
                    font-size: 13px;
                    margin-top: 25px;
                ">
                    Do not share this OTP with anyone.
                </p>

            </div>
        `
    });

    console.log("Password reset email sent successfully.");
}


// =========================================================
// HELPERS
// =========================================================

function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();
}


function generateOTP() {

    return crypto
        .randomInt(100000, 1000000)
        .toString();
}


function hashValue(value) {

    return crypto
        .createHash("sha256")
        .update(String(value))
        .digest("hex");
}


function generateResetToken() {

    return crypto
        .randomBytes(32)
        .toString("hex");
}


// =========================================================
// SIGN UP
// =========================================================

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            confirmPassword
        } = req.body;


        // -----------------------------------------
        // Validate fields
        // -----------------------------------------

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }


        // -----------------------------------------
        // Confirm password
        // -----------------------------------------

        if (
            confirmPassword &&
            password !== confirmPassword
        ) {

            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }


        // -----------------------------------------
        // Password length
        // -----------------------------------------

        if (String(password).length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
            });
        }


        const cleanEmail =
            normalizeEmail(email);


        // -----------------------------------------
        // Check existing user
        // -----------------------------------------

        const existingUser =
            await User.findOne({
                email: cleanEmail
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists"
            });
        }


        // -----------------------------------------
        // Hash password
        // -----------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // -----------------------------------------
        // Create user
        // -----------------------------------------

        const user =
            await User.create({

                name: String(name).trim(),

                email: cleanEmail,

                password: hashedPassword
            });


        // -----------------------------------------
        // Create JWT
        // -----------------------------------------

        const token =
            jwt.sign(
                {
                    userId: user._id,
                    email: user.email
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );


        return res.status(201).json({

            success: true,

            message:
                "Account created successfully",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                profilePic: user.profilePic
            }
        });


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create account"
        });
    }
});


// =========================================================
// LOGIN
// =========================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"
            });
        }


        const cleanEmail =
            normalizeEmail(email);


        // -----------------------------------------
        // Find user
        // -----------------------------------------

        const user =
            await User.findOne({
                email: cleanEmail
            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        // -----------------------------------------
        // Check password
        // -----------------------------------------

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordCorrect) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        // -----------------------------------------
        // Create JWT
        // -----------------------------------------

        const token =
            jwt.sign(
                {
                    userId: user._id,
                    email: user.email
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );


        return res.json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                profilePic: user.profilePic
            }
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Login failed"
        });
    }
});


// =========================================================
// FORGOT PASSWORD — SEND OTP
// =========================================================

router.post(
    "/forgot-password/send-otp",
    async (req, res) => {

        try {

            const {
                email
            } = req.body;


            // -----------------------------------------
            // Validate email
            // -----------------------------------------

            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email address is required"
                });
            }


            const cleanEmail =
                normalizeEmail(email);


            console.log(
                "Password reset requested."
            );


            // -----------------------------------------
            // Find user
            // -----------------------------------------

            const user =
                await User.findOne({
                    email: cleanEmail
                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No account found with this email address."
                });
            }


            // -----------------------------------------
            // Delete previous OTP
            // -----------------------------------------

            await PasswordReset.deleteMany({
                email: cleanEmail
            });


            // -----------------------------------------
            // Generate OTP
            // -----------------------------------------

            const otp =
                generateOTP();


            const otpHash =
                hashValue(otp);


            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );


            // -----------------------------------------
            // Save OTP
            // -----------------------------------------

            await PasswordReset.create({

                email: cleanEmail,

                otpHash,

                expiresAt,

                attempts: 0,

                verified: false
            });


            // -----------------------------------------
            // Send OTP using Brevo
            // -----------------------------------------

            try {

                await sendOTPEmail(
                    cleanEmail,
                    otp
                );


                return res.json({

                    success: true,

                    message:
                        "Verification code sent to your email."
                });


            } catch (emailError) {

                console.error(
                    "EMAIL SENDING ERROR:",
                    emailError.message
                );


                // Delete OTP if email failed
                await PasswordReset.deleteMany({
                    email: cleanEmail
                });


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to send the verification email. Please try again later."
                });
            }


        } catch (error) {

            console.error(
                "SEND OTP ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Could not send verification code."
            });
        }
    }
);


// =========================================================
// FORGOT PASSWORD — VERIFY OTP
// =========================================================

router.post(
    "/forgot-password/verify-otp",
    async (req, res) => {

        try {

            const {
                email,
                otp
            } = req.body;


            if (!email || !otp) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and OTP are required"
                });
            }


            const cleanEmail =
                normalizeEmail(email);


            const cleanOTP =
                String(otp).trim();


            // -----------------------------------------
            // Validate OTP format
            // -----------------------------------------

            if (!/^\d{6}$/.test(cleanOTP)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "OTP must be a 6-digit code"
                });
            }


            // -----------------------------------------
            // Find reset request
            // -----------------------------------------

            const resetRequest =
                await PasswordReset
                    .findOne({
                        email: cleanEmail
                    })
                    .sort({
                        createdAt: -1
                    });


            if (!resetRequest) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No active verification request. Please request a new OTP."
                });
            }


            // -----------------------------------------
            // Check expiration
            // -----------------------------------------

            if (
                resetRequest.expiresAt <
                new Date()
            ) {

                await PasswordReset.deleteOne({
                    _id: resetRequest._id
                });


                return res.status(400).json({

                    success: false,

                    message:
                        "OTP has expired. Please request a new OTP."
                });
            }


            // -----------------------------------------
            // Check already verified
            // -----------------------------------------

            if (resetRequest.verified) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This OTP has already been verified."
                });
            }


            // -----------------------------------------
            // Maximum attempts
            // -----------------------------------------

            if (
                resetRequest.attempts >= 5
            ) {

                await PasswordReset.deleteOne({
                    _id: resetRequest._id
                });


                return res.status(429).json({

                    success: false,

                    message:
                        "Too many incorrect attempts. Please request a new OTP."
                });
            }


            // -----------------------------------------
            // Hash submitted OTP
            // -----------------------------------------

            const submittedHash =
                hashValue(cleanOTP);


            const buf1 =
                Buffer.from(
                    submittedHash,
                    "utf8"
                );


            const buf2 =
                Buffer.from(
                    resetRequest.otpHash,
                    "utf8"
                );


            const otpCorrect =
                (
                    buf1.length ===
                    buf2.length
                ) &&
                crypto.timingSafeEqual(
                    buf1,
                    buf2
                );


            // -----------------------------------------
            // Incorrect OTP
            // -----------------------------------------

            if (!otpCorrect) {

                resetRequest.attempts += 1;

                await resetRequest.save();


                const remaining =
                    Math.max(
                        0,
                        5 -
                        resetRequest.attempts
                    );


                return res.status(401).json({

                    success: false,

                    message:
                        `Incorrect OTP. ${remaining} attempts remaining.`
                });
            }


            // -----------------------------------------
            // Generate reset token
            // -----------------------------------------

            const resetToken =
                generateResetToken();


            const resetTokenHash =
                hashValue(resetToken);


            resetRequest.verified =
                true;


            resetRequest.resetTokenHash =
                resetTokenHash;


            resetRequest.resetTokenExpiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );


            await resetRequest.save();


            return res.json({

                success: true,

                message:
                    "OTP verified successfully.",

                resetToken
            });


        } catch (error) {

            console.error(
                "VERIFY OTP ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Could not verify OTP."
            });
        }
    }
);


// =========================================================
// FORGOT PASSWORD — RESEND OTP
// =========================================================

router.post(
    "/forgot-password/resend-otp",
    async (req, res) => {

        try {

            const {
                email
            } = req.body;


            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email address is required"
                });
            }


            const cleanEmail =
                normalizeEmail(email);


            // -----------------------------------------
            // Find user
            // -----------------------------------------

            const user =
                await User.findOne({
                    email: cleanEmail
                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No account found with this email address."
                });
            }


            // -----------------------------------------
            // Delete old OTP
            // -----------------------------------------

            await PasswordReset.deleteMany({
                email: cleanEmail
            });


            // -----------------------------------------
            // Generate new OTP
            // -----------------------------------------

            const otp =
                generateOTP();


            const otpHash =
                hashValue(otp);


            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );


            // -----------------------------------------
            // Save new OTP
            // -----------------------------------------

            await PasswordReset.create({

                email: cleanEmail,

                otpHash,

                expiresAt,

                attempts: 0,

                verified: false
            });


            // -----------------------------------------
            // Send new OTP
            // -----------------------------------------

            try {

                await sendOTPEmail(
                    cleanEmail,
                    otp
                );


                return res.json({

                    success: true,

                    message:
                        "A new OTP has been sent to your email."
                });


            } catch (emailError) {

                console.error(
                    "RESEND EMAIL ERROR:",
                    emailError.message
                );


                await PasswordReset.deleteMany({
                    email: cleanEmail
                });


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to resend the verification email. Please try again later."
                });
            }


        } catch (error) {

            console.error(
                "RESEND OTP ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Could not resend OTP."
            });
        }
    }
);


// =========================================================
// FORGOT PASSWORD — RESET PASSWORD
// =========================================================

router.post(
    "/forgot-password/reset",
    async (req, res) => {

        try {

            const {
                email,
                resetToken,
                newPassword
            } = req.body;


            // -----------------------------------------
            // Validate fields
            // -----------------------------------------

            if (
                !email ||
                !resetToken ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email, reset token and new password are required"
                });
            }


            // -----------------------------------------
            // Password length
            // -----------------------------------------

            if (
                String(newPassword).length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password must be at least 6 characters"
                });
            }


            const cleanEmail =
                normalizeEmail(email);


            // -----------------------------------------
            // Find verified reset request
            // -----------------------------------------

            const resetRequest =
                await PasswordReset
                    .findOne({

                        email: cleanEmail,

                        verified: true
                    })
                    .sort({
                        createdAt: -1
                    });


            if (
                !resetRequest ||
                !resetRequest.resetTokenHash ||
                !resetRequest.resetTokenExpiresAt
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Password reset session is invalid. Please start again."
                });
            }


            // -----------------------------------------
            // Check token expiration
            // -----------------------------------------

            if (
                resetRequest.resetTokenExpiresAt <
                new Date()
            ) {

                await PasswordReset.deleteOne({
                    _id: resetRequest._id
                });


                return res.status(401).json({

                    success: false,

                    message:
                        "Password reset session has expired. Please request a new OTP."
                });
            }


            // -----------------------------------------
            // Verify reset token
            // -----------------------------------------

            const submittedTokenHash =
                hashValue(resetToken);


            if (
                submittedTokenHash !==
                resetRequest.resetTokenHash
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid password reset session."
                });
            }


            // -----------------------------------------
            // Find user
            // -----------------------------------------

            const user =
                await User.findOne({
                    email: cleanEmail
                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Account not found."
                });
            }


            // -----------------------------------------
            // Hash new password
            // -----------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            user.password =
                hashedPassword;


            await user.save();


            // -----------------------------------------
            // Delete reset request
            // Makes token single-use
            // -----------------------------------------

            await PasswordReset.deleteOne({
                _id: resetRequest._id
            });


            console.log(
                "PASSWORD RESET SUCCESSFULLY"
            );


            return res.json({

                success: true,

                message:
                    "Password reset successfully. You can now log in."
            });


        } catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Could not reset password."
            });
        }
    }
);


// =========================================================
// GET LOGGED-IN USER
// =========================================================

router.get("/me", async (req, res) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication token is required"
            });
        }


        const token =
            authHeader.substring(7);


        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        const user =
            await User
                .findById(
                    decoded.userId
                )
                .select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        return res.json({

            success: true,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                profilePic: user.profilePic
            }
        });


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired token"
        });
    }
});


// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;