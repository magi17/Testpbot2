module.exports = {
    name: 'help',
    execute(senderId, event, messageText, sendTextMessage) {
        sendTextMessage(senderId, 'Available commands:\n- hello\n- help\n- time\n- extract (send with an image)');
    }
};
