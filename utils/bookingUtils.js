const mongoose = require('mongoose');
const ClientAppointment = require('../models/ClientAppointment');

// Check if the user has booked an appointment within the last hour
async function hasRecentAppointment(email) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAppointment = await ClientAppointment.findOne({
        email: email,
        createdAt: { $gte: oneHourAgo }
    });
    return recentAppointment !== null;
}

async function bookAppointment(details) {
    try {
        if (await hasRecentAppointment(details.email)) {
            throw new Error("You can book a new service after 1 hour.");
        }
        const appointment = new ClientAppointment(details);
        await appointment.save();
        return `Appointment booked successfully for ${details.service} on ${details.date} at ${details.time}.`;
    } catch (error) {
        console.error("Error booking appointment:", error);
        throw new Error(error.message || "Failed to book appointment");
    }
}

module.exports = {
    bookAppointment,
    hasRecentAppointment
};