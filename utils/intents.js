const generalQueriesExamples = [
    "What services do you offer?",
    "Tell me about your services.",
    "What are the prices of your services?",
    "Can you list your services?",
    "Give me an overview of your services.",
    "available services",
    "services"
];

const specifiedServiceQueriesExamples = [
    "Can I book a Relaxing Swedish Massage?",
    "What are your Sunrise Spa services?",
    "Tell me more about Foot Reflexology.",
    "Do you offer Yoga Class?",
    "I need details on your Sunrise Spa treatments."
];

const bookingServiceExamples = [
    "Book an appointment for a Relaxing Swedish Massage tomorrow at 10 AM.",
    "I'd like to schedule a Foot Reflexology for next week.",
    "Can I book a Yoga Class for next Monday?",
    "Schedule a Sunrise Spa appointment for Friday.",
    "I want to book a service."
];

const determineIntent = (message, services) => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("book appointment") || lowerCaseMessage.includes("book appointment") || lowerCaseMessage.includes("schedule appointment")) {
        return 'booking';
    } else if (generalQueriesExamples.some(query => lowerCaseMessage.includes(query.toLowerCase()))) {
        return 'general_services';
    } else {
        const service = services.find(service =>
            lowerCaseMessage.includes(service.name.toLowerCase()) ||
            (service.providerEmail && lowerCaseMessage.includes(service.providerEmail.toLowerCase()))
        );
        if (service) {
            return 'specified_service';
        } else {
            return 'general';
        }
    }
};

module.exports = {
    generalQueriesExamples,
    specifiedServiceQueriesExamples,
    bookingServiceExamples,
    determineIntent
};
