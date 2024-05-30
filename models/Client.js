// models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    // Add other relevant fields here
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
