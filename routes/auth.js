// =========================================================
// THE PAPER NEST — AUTH ROUTES
// LOGIN + SIGNUP + FORGOT PASSWORD OTP + ME
// =========================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const PasswordReset = require("../models/passwordreset");

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || "daily-planner-secret-key-2026";

if (!process.env.JWT_SECRET) {
    console.warn(
        "JWT_SECRET is missing from environment variables. Using fallback secret."
    );
}

// =========================================================
// EMAIL CONFIGURATION — BREVO
// =========================================================

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is missing from environment variables.");
}

if (!EMAIL_FROM) {
    console.warn("EMAIL_FROM is missing from environment variables.");
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
// SEND OTP EMAIL THROUGH BREVO
// =========================================================

async function sendOTPEmail(email, otp) {
    if (!BREVO_API_KEY || !EMAIL_FROM) {
        throw new Error(
            "Brevo email is not configured. Please set BREVO_API_KEY and EMAIL_FROM in Railway Variables."
        );
    }

    const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
            method: "POST",

            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },

            body: JSON.stringify({
                sender: {
                    name: "The Paper Nest",
                    email: EMAIL_FROM
                },

                to: [
                    {
                        email: email
                    }
                ],

                subject:
                    "The Paper Nest — Password Reset OTP",

                textContent:
                    `The Paper Nest\n\n` +
                    `Your password reset verification code is:\n\n` +
                    `${otp}\n\n` +
                    `This OTP will expire in 10 minutes.\n\n` +
                    `If you did not request a password reset, please ignore this email.\n\n` +
                    `Do not share this OTP with anyone.`,

                htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>The Paper Nest - Password Reset</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f7f1e8;
        font-family:Arial,Helvetica,sans-serif;
    "
>

    <div
        style="
            max-width:600px;
            margin:40px auto;
            background:white;
            border-radius:16px;
            padding:40px;
            box-sizing:border-box;
            text-align:center;
            box-shadow:0 10px 30px rgba(0,0,0,0.05);
        "
    >

        <h1
            style="
                margin:0 0 10px;
                color:#4e3b32;
                font-size:32px;
            "
        >
            The Paper Nest
        </h1>

        <p
            style="
                color:#765f52;
                font-size:16px;
                margin-bottom:30px;
            "
        >
            Password Reset Verification
        </p>

        <p
            style="
                color:#333;
                font-size:16px;
            "
        >
            Your verification code is:
        </p>

        <div
            style="
                display:inline-block;
                padding:18px 28px;
                margin:20px 0;
                border-radius:12px;
                background:#eee7dc;
                color:#4e3b32;
                font-size:36px;
                font-weight:bold;
                letter-spacing:8px;
            "
        >
            ${otp}
        </div>

        <p
            style="
                color:#555;
                font-size:15px;
            "
        >
            This OTP will expire in
            <strong>10 minutes</strong>.
        </p>

        <p
            style="
                color:#888;
                font-size:13px;
                margin-top:30px;
            "
        >
            If you did not request a password reset,
            you can safely ignore this email.
        </p>

        <p
            style="
                color:#888;
                font-size:13px;
            "
        >
            Never share your OTP with anyone.
        </p>

    </div>

</body>
</html>
`
            })
        }
    );

    if (!response.ok) {
        let details = "";

        try {
            const data = await response.json();

            details =
                data?.message ||
                data?.code ||
                JSON.stringify(data);

        } catch (_) {
            details = await response.text().catch(() => "");
        }

        throw new Error(
            `Brevo email failed (${response.status})${
                details ? `: ${details}` : ""
            }`
        );
    }

    return response.json().catch(() => ({}));
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

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }

        if (
            confirmPassword &&
            password !== confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
            });
        }

        const cleanEmail = normalizeEmail(email);

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name: String(name).trim(),
            email: cleanEmail,
            password: hashedPassword
        });

        const token = jwt.sign(
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

        console.error("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create account"
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

        const cleanEmail = normalizeEmail(email);

        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
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

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
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

            console.log(
                "PASSWORD RESET OTP REQUEST RECEIVED"
            );

            const { email } = req.body;

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
                "Password reset requested for:",
                cleanEmail
            );

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

            // Remove previous reset tokens
            await PasswordReset.deleteMany({
                email: cleanEmail
            });

            const otp = generateOTP();

            const otpHash =
                hashValue(otp);

            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );

            await PasswordReset.create({
                email: cleanEmail,
                otpHash,
                expiresAt,
                attempts: 0,
                verified: false
            });

            console.log(
                "Password reset OTP generated for:",
                cleanEmail
            );

            try {

                await sendOTPEmail(
                    cleanEmail,
                    otp
                );

                console.log(
                    "OTP email sent successfully to:",
                    cleanEmail
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

                return res.status(500).json({
                    success: false,
                    message:
                        "We could not send the verification email. Please try again later."
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

            if (!/^\d{6}$/.test(cleanOTP)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "OTP must be a 6-digit code"
                });
            }

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

            if (resetRequest.verified) {
                return res.status(400).json({
                    success: false,
                    message:
                        "This OTP has already been verified."
                });
            }

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
                buf1.length === buf2.length &&
                crypto.timingSafeEqual(
                    buf1,
                    buf2
                );

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

            const resetToken =
                generateResetToken();

            const resetTokenHash =
                hashValue(resetToken);

            resetRequest.verified = true;

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

            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email address is required"
                });
            }

            const cleanEmail =
                normalizeEmail(email);

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

            await PasswordReset.deleteMany({
                email: cleanEmail
            });

            const otp =
                generateOTP();

            const otpHash =
                hashValue(otp);

            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );

            await PasswordReset.create({
                email: cleanEmail,
                otpHash,
                expiresAt,
                attempts: 0,
                verified: false
            });

            console.log(
                "Password reset OTP regenerated for:",
                cleanEmail
            );

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

                return res.status(500).json({
                    success: false,
                    message:
                        "We could not resend the verification email. Please try again later."
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

            if (
                String(newPassword).length <
                6
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password must be at least 6 characters"
                });
            }

            const cleanEmail =
                normalizeEmail(email);

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

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            user.password =
                hashedPassword;

            await user.save();

            await PasswordReset.deleteOne({
                _id: resetRequest._id
            });

            console.log(
                "PASSWORD RESET SUCCESSFULLY FOR:",
                cleanEmail
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

router.get(
    "/me",
    async (req, res) => {

        try {

            const authHeader =
                req.headers.authorization;

            if (
                !authHeader ||
                !authHeader.startsWith(
                    "Bearer "
                )
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
                await User.findById(
                    decoded.userId
                ).select("-password");

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
    }
);

// =========================================================
// EXPORT
// =========================================================

module.exports = router;