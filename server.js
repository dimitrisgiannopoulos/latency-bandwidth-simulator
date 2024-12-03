const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (frontend)
app.use(express.static('public'));

// Endpoint to simulate server response
app.post('/simulate', (req, res) => {
    const level = req.body.level || 'light';

    // Define payload sizes for different AR levels (in MB)
    const payloads = {
        light: { send: 2 * 1024 * 1024, receive: 2 * 1024 * 1024 }, // 2 MB
        medium: { send: 5 * 1024 * 1024, receive: 5 * 1024 * 1024 }, // 5 MB
        heavy: { send: 10 * 1024 * 1024, receive: 10 * 1024 * 1024 }, // 10 MB
    };

    const { send, receive } = payloads[level];

    // Simulate received data
    const responsePayload = Buffer.alloc(receive, 'A').toString('base64');

    // Respond with simulated data and server timestamp
    res.json({
        responsePayload,
        timestamp: Date.now()
    });
});

// Start the server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
