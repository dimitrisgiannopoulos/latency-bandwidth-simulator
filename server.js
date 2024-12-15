const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

let gameState = {
    ball: { x: 250, y: 250, vx: 2, vy: 3 },
    paddle: { x: 200, width: 100 },
    score: 0,
    gameOver: false,
};

let gameInterval = null;

// Define padding levels
const paddingLevels = {
    // Light: 0               // 0 bytes
    Light: 2 * 1024 * 1024,  // 2 MB
    Medium: 5 * 1024 * 1024, // 5 MB
    Heavy: 10 * 1024 * 1024  // 10 MB
};

// Default padding level
let selectedPaddingLevel = 'Light';

function resetGameState() {
    gameState = {
        ball: { x: 250, y: 250, vx: 2, vy: 3 },
        paddle: { x: 200, width: 100 },
        score: 0,
        gameOver: false,
    };
}

function broadcastGameState() {
    const payloadSize = paddingLevels[selectedPaddingLevel];
    const paddedMessage = createPaddedMessage({ type: 'gameState', gameState }, payloadSize);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(paddedMessage);
        }
    });
}

function startGame() {
    resetGameState();
    broadcastGameState();

    if (gameInterval) clearInterval(gameInterval);

    gameInterval = setInterval(() => {
        if (!gameState.gameOver) {
            gameState.ball.x += gameState.ball.vx;
            gameState.ball.y += gameState.ball.vy;

            if (gameState.ball.x <= 0 || gameState.ball.x >= 500) {
                gameState.ball.vx *= -1;
            }
            if (gameState.ball.y <= 0) {
                gameState.ball.vy *= -1;
            }
            if (
                gameState.ball.y >= 480 &&
                gameState.ball.x >= gameState.paddle.x &&
                gameState.ball.x <= gameState.paddle.x + gameState.paddle.width
            ) {
                gameState.ball.vy *= -1;
                gameState.score += 1;
            }

            if (gameState.ball.y > 500) {
                gameState.gameOver = true;
            }

            broadcastGameState();
        } else {
            clearInterval(gameInterval);
        }
    }, 16);
}

// Function to pad messages
function createPaddedMessage(originalMessage, sizeInBytes) {
    const originalJSON = JSON.stringify(originalMessage);
    const paddingLength = Math.max(0, sizeInBytes - originalJSON.length);
    const padding = 'X'.repeat(paddingLength); // Fill remaining space with "X"
    return JSON.stringify({ message: originalMessage, padding });
}

wss.on('connection', (ws) => {
    console.log('New connection established.');

    ws.on('message', (message) => {
        const clientData = JSON.parse(message);

        if (clientData.type === 'paddleMove') {
            // Adjust paddle position based on direction (-1 for left, 1 for right)
            const direction = clientData.direction; // Should be -1 or 1
            gameState.paddle.x = Math.max(
                0,
                Math.min(400, gameState.paddle.x + direction * 20) // Move 20 pixels per step
            );
            broadcastGameState(); // Broadcast updated game state to all clients       
        } else if (clientData.type === 'startGame') {
            startGame();
        } else if (clientData.type === 'ping') {
            const pongPayloadSize = paddingLevels[selectedPaddingLevel];
            const paddedPongMessage = createPaddedMessage(
                { type: 'pong', time: clientData.time },
                pongPayloadSize
            );
            ws.send(paddedPongMessage);
        } else if (clientData.type === 'updatePadding') {
            // Update the padding level based on the client's request
            selectedPaddingLevel = clientData.level;
            console.log(`Updated padding level to: ${selectedPaddingLevel}`);
        }
    });

    ws.on('close', () => {
        console.log('Connection closed.');
    });
});

app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
