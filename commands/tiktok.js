const axios = require('axios');
const request = require('request');

module.exports = {
    name: 'tiktok',
    description: 'Send a random TikTok video.',
    async execute(senderId, event, messageText, sendTextMessage, sendVideoAttachment) {
        try {
            const response = await axios.get('https://apis-i26b.onrender.com/tikrandom');
            if (response.data && response.data.playUrl) {
                const videoUrl = response.data.playUrl;
                sendVideoAttachment(senderId, videoUrl);
            } else {
                sendTextMessage(senderId, 'Could not fetch a TikTok video at the moment.');
            }
        } catch (error) {
            console.error('Error fetching TikTok video:', error);
            sendTextMessage(senderId, 'An error occurred while fetching the TikTok video.');
        }
    }
};