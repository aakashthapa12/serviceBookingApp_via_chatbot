const express = require('express');
const router = express.Router();
const ClientAppointment = require('../models/ClientAppointment'); 

router.get('/client_Appointments', async (req, res) => {
    const { email } = req.query;

    try {
        const appointments = await ClientAppointment.find({ email });
        res.render('client_Appointments', { appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).send("Failed to fetch appointments");
    }
});

module.exports = router;
