const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema(

    {

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        title: {
            type: String,
            required: true,
            trim: true
        },


        time: {
            type: String,
            default: ""
        },


        subject: {
            type: String,
            default: "General"
        },


        priority: {
            type: String,
            enum: [
                "Low",
                "Normal",
                "High"
            ],
            default: "Normal"
        },


        completed: {
            type: Boolean,
            default: false
        },


        date: {
            type: String,
            required: true
        }

    },

    {
        timestamps: true
    }

);


module.exports =
    mongoose.model(
        "Task",
        taskSchema
    );