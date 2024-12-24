import mongoose from "mongoose";

const ErrorLogScheme = new mongoose.Schema({
    message: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: false,
    },
    at: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: false,
    },
}, { timestamps: true })

export const ErrorLog = mongoose.model('ErrorLog', ErrorLogScheme)