const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        username: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true,
            minlength: 3,
            maxlength: 30,
            match: /^[a-z0-9._]+$/
        },

        password: {
            type: String,
            required: true
        },

        profilePic: {
            type: String,
            default: null
        },

        bio: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        resetOTP: {
            type: String,
            default: null
        },

        resetOTPExpires: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);