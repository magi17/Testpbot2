require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const request = require('request');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const commands = new Map();
const recentImages = new Map(); // Store the most recent image per user

// Load commands dynamically
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
}

app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            entry.messaging.forEach(webhookEvent => {
                const senderId = webhookEvent.sender.id;

                // Store recent image if received
                if (webhookEvent.message && webhookEvent.message.attachments) {
                    webhookEvent.message.attachments.forEach(attachment => {
                        if (attachment.type === 'image') {
                            const imageUrl = attachment.payload.url;
                            recentImages.set(senderId, imageUrl);
                        }
                    });
                }

                // Handle text commands only
                if (webhookEvent.message && webhookEvent.message.text) {
                    const messageText = webhookEvent.message.text.trim();
                    const commandName = messageText.split(' ')[0].toLowerCase();

                    if (commands.has(commandName)) {
                        commands.get(commandName).execute(
                            senderId, 
                            webhookEvent, 
                            messageText, 
                            sendTextMessage, 
                            recentImages, 
                            sendVideoAttachment
                        );
                    }
                }
            });
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Verification endpoint
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Send text message helper
function sendTextMessage(senderId, text) {
    request({
        uri: 'https://graph.facebook.com/v18.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: { text: text }
        }
    }, (err, res, body) => {
        if (err) {
            console.error('Error sending message: ', err);
        } else if (res.body.error) {
            console.error('Error response from Facebook: ', res.body.error);
        }
    });
}

// Send video attachment helper
function sendVideoAttachment(senderId, videoUrl) {
    request({
        uri: 'https://graph.facebook.com/v18.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: 'video',
                    payload: {
                        url: videoUrl,
                        is_reusable: false
                    }
                }
            }
        }
    }, (err, res, body) => {
        if (err) {
            console.error('Error sending video attachment: ', err);
        } else if (res.body.error) {
            console.error('Error response from Facebook: ', res.body.error);
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot server running on port ${PORT}`));