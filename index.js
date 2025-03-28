require('dotenv').config(); 
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
const recentImages = new Map();

// Load commands dynamically
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
}

app.post('/api/webhook', (req, res) => {
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
                        commands.get(commandName).execute(senderId, webhookEvent, messageText, sendTextMessage, recentImages);
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
app.get('/api/webhook', (req, res) => {
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

// Helper to send text
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
        } else if (res.body && res.body.error) {
            console.error('Facebook API error: ', res.body.error);
        }
    });
}

// Export app for Vercel
module.exports = app;
