
const express = require('express');
const router = express.Router();
const openai = require('../utils/openai'); // Ensure this is correctly imported and initialized
const { determineIntent } = require('../utils/intents');
const Service = require('../models/Service');
const ClientAppointment = require('../models/ClientAppointment'); // Import ClientAppointment model
const contextManager = require('../utils/contextManager');
const { processFile } = require('../utils/fileProcessing');

router.get('/chatbot', (req, res) => {
    res.render('chatbot');
});

async function getServices() {
    try {
        const services = await Service.find().populate("provider_id");
        return services.map((service) => ({
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            providerEmail: service.provider_id ? service.provider_id.email : "Email not available",
            serviceInformation: service.serviceInformation,
        }));
    } catch (error) {
        console.error("Error fetching services from the database:", error);
        throw new Error("Failed to fetch services");
    }
}

async function bookAppointment(details) {
    try {
        const appointment = new ClientAppointment(details);
        await appointment.save();
        return `Appointment booked successfully for ${details.service} on ${details.date} at ${details.time}.`;
    } catch (error) {
        console.error("Error booking appointment:", error);
        throw new Error("Failed to book appointment");
    }
}

router.post('/chat', async (req, res) => {
    const { userMessage, uploadedFile, userId } = req.body;

    console.log('Received user message:', userMessage);

    try {
        const services = await getServices();
        const session = contextManager.getSession(userId) || {};
        const intent = determineIntent(userMessage, services);
        let responseText = '';

        // Utility function to reset the booking flow
        const resetBookingFlow = () => {
            contextManager.updateSession(userId, { lastIntent: null, bookingDetails: {} });
        };

        // Check if the user wants to restart the booking process
        if (userMessage.toLowerCase().includes('start over') || userMessage.toLowerCase().includes('restart')) {
            resetBookingFlow();
            responseText = 'Okay, let\'s start over. Please let me know the service you are interested in.';
        } else if (session.lastIntent === 'booking' && !userMessage.toLowerCase().includes('book')) {
            // Continue the booking flow based on the collected details
            if (!session.bookingDetails) {
                session.bookingDetails = {};
            }

            if (!session.bookingDetails.name) {
                session.bookingDetails.name = userMessage;
                responseText = 'Please provide your mobile number.';
            } else if (!session.bookingDetails.mobile) {
                session.bookingDetails.mobile = userMessage;
                responseText = 'Please carefully provide your email, as you will need it to view your booking appointment.';
            } else if (!session.bookingDetails.email) {
                session.bookingDetails.email = userMessage;
                responseText = 'Please provide the desired date for the appointment.';
            } else if (!session.bookingDetails.date) {
                session.bookingDetails.date = userMessage;
                responseText = 'Please provide the desired time for the appointment.';
            } else {
                session.bookingDetails.time = userMessage;
                const bookingDetails = {
                    name: session.bookingDetails.name,
                    mobile: session.bookingDetails.mobile,
                    email: session.bookingDetails.email,
                    service: session.bookingDetails.service,
                    date: session.bookingDetails.date,
                    time: session.bookingDetails.time,
                };
                responseText = await bookAppointment(bookingDetails);
                resetBookingFlow(); // Clear the session after booking is completed
                responseText += "\n\nWould you like to know about other services? If yes, please specify the service or ask about all services.";
            }

            contextManager.updateSession(userId, session);
        } else if (session.lastIntent === 'specified_service' && userMessage.toLowerCase().includes('book')) {
            // User wants to book the specified service
            const service = services.find(s => s.name.toLowerCase() === session.lastService.name.toLowerCase());
            if (service) {
                session.bookingDetails = { service: service.name };
                contextManager.updateSession(userId, { lastIntent: 'booking', bookingDetails: session.bookingDetails });
                responseText = `Great! To book ${service.name}, I need to gather some details. Please provide your name.`;
            } else {
                responseText = "Sorry, I couldn't find the service you mentioned.";
            }
        } else {
            // Handle different intents
            switch (intent) {
                case 'booking':
                    responseText = 'To book an appointment, please provide the name of the service you are interested in.';
                    contextManager.updateSession(userId, { lastIntent: 'booking' });
                    break;

                case 'specified_service':
                    const service = services.find(s => userMessage.toLowerCase().includes(s.name.toLowerCase()));
                    if (service) {
                        const formattedServiceInformation = service.serviceInformation || 'No additional information available.';
                        responseText = `**${service.name}**\nDescription: ${service.description}\n\nPrice: Rs ${service.price}\n\nDuration: ${service.duration} minutes\n\nProvider Email: ${service.providerEmail}\n\nService Information:\n\n${formattedServiceInformation}\n\nWould you like to book this service? Please type 'book' to proceed or ask about another service.`;
                        contextManager.updateSession(userId, { lastIntent: 'specified_service', lastService: service });
                    } else {
                        responseText = "Sorry, I couldn't find information about the specified service.";
                    }
                    break;

                case 'general_services':
                    responseText = 'Here are the services we offer:\n\n' + services.map(service =>
                        `**${service.name}**\nDescription: ${service.description}\nPrice: Rs ${service.price}\nDuration: ${service.duration} minutes\n`).join('\n\n');
                    contextManager.updateSession(userId, { lastIntent: 'general_services' });
                    break;

                case 'general':
                    try {
                        if (uploadedFile) {
                            const summary = await processFile(uploadedFile.path, uploadedFile.mimetype.split('/')[0]);
                            responseText = summary;
                        } else {
                            const completion = await openai.createCompletion({
                                model: "gpt-4",
                                prompt: `User query: ${userMessage}\nRespond as a service booking chatbot.`,
                                temperature: 0.4,
                                max_tokens: 256,
                                top_p: 1,
                                frequency_penalty: 0,
                                presence_penalty: 0
                            });
                            responseText = completion.choices[0].text.trim();
                        }
                        contextManager.updateSession(userId, { lastIntent: 'general', lastMessage: userMessage });
                    } catch (error) {
                        console.error("Error processing general query:", error);
                        responseText = "Apologies; it appears that you either typed the service incorrectly or it is not on the list! Would you kindly check it once more?";
                    }
                    break;

                default:
                    responseText = "I'm sorry, I didn't understand that. Can you please clarify?";
                    contextManager.updateSession(userId, { lastIntent: 'unknown', lastMessage: userMessage });
            }
        }

        console.log('Sending response:', responseText);
        res.json({ response: responseText });
    } catch (error) {
        console.error("Error interacting with the OpenAI API:", error);
        res.status(500).json({ error: "Failed to get response from the OpenAI API" });
    }
});

module.exports = router;
