const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    fullname: { type: String, },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Register', registerSchema);
