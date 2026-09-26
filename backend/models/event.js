const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        date: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}$/
        },
        time: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            enum: ["Exam", "Assignment", "Meeting", "Birthday", "Personal", "Other"],
            default: "Personal"
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
