// models/Authentication.js
const mongoose = require('mongoose');

const authenticationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'service_provider'], required: true }
});

module.exports = mongoose.model('Authentication', authenticationSchema);
   
