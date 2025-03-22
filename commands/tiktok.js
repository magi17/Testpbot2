const axios = require('axios');

module.exports = {
    name: 'tiktok',
    description: 'Send random TikTok video',
    async execute(senderId, webhookEvent, messageText, sendTextMessage, recentImages, sendVideoAttachment) {
        try {
            const response = await axios.get('https://apis-i26b.onrender.com/tikrandom');
            const videoUrl = response.data.playUrl;

            if (videoUrl) {
                sendVideoAttachment(senderId, videoUrl);
            } else {
                sendTextMessage(senderId, 'Sorry, could not fetch a TikTok video right now.');
            }
        } catch (error) {
            console.error('Error fetching TikTok video:', error);
            sendTextMessage(senderId, 'There was an error fetching the TikTok video.');
        }
    }
};