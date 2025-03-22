module.exports = {
    name: 'extract',
    execute(senderId, event, messageText, sendTextMessage) {
        if (event.message.attachments) {
            const imageAttachment = event.message.attachments.find(att => att.type === 'image');
            if (imageAttachment) {
                const imageUrl = imageAttachment.payload.url;
                sendTextMessage(senderId, `Extracted image URL:\n${imageUrl}`);
            } else {
                sendTextMessage(senderId, `No image found in your message. Please send the "extract" command along with an image.`);
            }
        } else {
            sendTextMessage(senderId, `Please send the "extract" command along with an image to extract its URL.`);
        }
    }
};
