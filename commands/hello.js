module.exports = {
    name: 'hello',
    execute(senderId, event, messageText, sendTextMessage) {
        sendTextMessage(senderId, 'Hello! How can I help you today?');
    }
};
