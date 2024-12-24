import mongoose from 'mongoose';

const UserScheme = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    fullName: {
        type: mongoose.SchemaTypes.String,
        required: false,
    },
    phone: {
        type: mongoose.SchemaTypes.String,
        required: false,
        unique: true,
    },
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    role: {
        type: mongoose.SchemaTypes.ObjectId,
        ref:  'Role',
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    lastLogin: {
        type: mongoose.SchemaTypes.Date,
    },
    lastRefresh: {
        type: mongoose.SchemaTypes.Date,
    },
    activeRefreshToken: {
        type: mongoose.SchemaTypes.String,
    }
})

export const User = mongoose.model('User', UserScheme)