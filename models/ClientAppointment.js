// models/ClientAppointment.js
const mongoose = require('mongoose');

const ClientAppointmentSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    service: String,
    date: String,
    time: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ClientAppointment = mongoose.model('ClientAppointment', ClientAppointmentSchema);

module.exports = ClientAppointment;
