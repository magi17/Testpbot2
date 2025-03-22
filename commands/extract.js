module.exports = {
    name: 'extract',
    execute(senderId, event, messageText, sendTextMessage, recentImages) {
        if (recentImages.has(senderId)) {
            const imageUrl = recentImages.get(senderId);
            sendTextMessage(senderId, `Last received image URL:\n${imageUrl}`);
        } else {
            sendTextMessage(senderId, 'No recent image found. Please send an image first, then type "extract".');
        }
    }
};