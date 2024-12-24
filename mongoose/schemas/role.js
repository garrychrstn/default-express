import mongoose from 'mongoose';

const RoleScheme = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    phone: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: false,
    },
    users: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref:  'User',
    }]
})

export const Role = mongoose.model('Role', RoleScheme)