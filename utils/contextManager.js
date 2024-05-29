class ContextManager {
    constructor() {
        this.sessions = {};
    }

    getSession(userId) {
        if (!this.sessions[userId]) {
            this.sessions[userId] = {
                lastIntent: null,
                lastService: null,
                bookingDetails: null
            };
        }
        return this.sessions[userId];
    }

    updateSession(userId, data) {
        this.sessions[userId] = {
            ...this.getSession(userId),
            ...data
        };
    }

    clearSession(userId) {
        delete this.sessions[userId];
    }
}

module.exports = new ContextManager();



