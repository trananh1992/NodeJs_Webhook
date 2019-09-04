'use strict';
let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    request = require('request'),
    images = require('./pics');
const PAGE_ACCESS_TOKEN = 'EAAEu8ZBZCyuxMBAJZAZCTqZB5ww73J3mqKyi1wEH2SDIocdtmO4ywVJnl2nQmzD4bzHZCnnqiljYrUzTfBxKaxxZCj2SQYtxA1nazh1BgxhAmptYuUUbCKzF8zFFjz8WceRyGIfeoCMbIH7jWYrHxMOhGHvLFrZCXiAC7IdjEzGD5WniKENyJVuk';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(8989, () => console.log('Example app listening on port 8989!'));

app.get('/', (req, res) => res.send('Hello World!'));

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "07041992";

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
            
            var text = webhook_event.message.text;
            
            sendMessage(sender_psid, "Hello!! I'm a bot. Your message: " + text);
            
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Sends response messages via the Send API
function sendMessage(sender_psid, response) {
    // Construct the message body
    let request_body = {
        recipient: {
            id: sender_psid
        },
        message: {
            text: response
        }
    };

    // Send the HTTP request to the Messenger Platform
    request({
        uri: "https://graph.facebook.com/v4.0/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body
    }, (err, res, body) => {
        if (!err) {
            console.log("Send success: "+res);
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
