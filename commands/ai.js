const axios = require('axios');

module.exports = {
    name: 'ai',
    description: 'Ask Gemini AI with optional text and/or image reply.',
    async execute(senderId, event, messageText, sendTextMessage, recentImages) {
        try {
            const ask = messageText.slice(3).trim(); 

            let imageUrl = null;

            // Check if user replied to an image message
            if (event.message && event.message.reply_to) {
                const repliedMsg = event.message.reply_to;
                if (repliedMsg.attachments && repliedMsg.attachments[0].type === 'image') {
                    imageUrl = repliedMsg.attachments[0].payload.url;
                }
            }

            // If not replying to image, use recent stored image (if available)
            if (!imageUrl) {
                imageUrl = recentImages.get(senderId) || null;
            }

            // If question only
            if (ask && !imageUrl) {
                const apiUrl = `https://apis-i26b.onrender.com/gemini?ask=${encodeURIComponent(ask)}`;
                const response = await axios.get(apiUrl);

                if (response.data && response.data.description) {
                    sendTextMessage(senderId, `Gemini AI says:\n${response.data.description}`);
                } else {
                    sendTextMessage(senderId, 'Sorry, no response from the AI API.');
                }
                return;
            }

            // If question + image
            if (ask && imageUrl) {
                const apiUrl = `https://apis-i26b.onrender.com/gemini?ask=${encodeURIComponent(ask)}&imagurl=${encodeURIComponent(imageUrl)}`;
                const response = await axios.get(apiUrl);

                if (response.data && response.data.description) {
                    sendTextMessage(senderId, `Gemini AI says:\n${response.data.description}`);
                } else {
                    sendTextMessage(senderId, 'Sorry, no response from the AI API.');
                }
                return;
            }

            // If nothing provided
            sendTextMessage(senderId, 'Please provide a question or reply to an image with "ai <your question>".');

        } catch (err) {
            console.error('Error in AI command:', err);
            sendTextMessage(senderId, 'An error occurred while processing your AI request.');
        }
    }
};