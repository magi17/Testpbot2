module.exports = {
    name: 'time',
    execute(senderId, event, messageText, sendTextMessage) {
        const currentTime = new Date().toLocaleString();
        sendTextMessage(senderId, `Current server time is: ${currentTime}`);
    }
};
