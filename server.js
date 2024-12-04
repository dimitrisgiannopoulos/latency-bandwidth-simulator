const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Game State
let gameState = {
    ball: { x: 250, y: 250, vx: 2, vy: 3 },
    paddle: { x: 200, width: 100 },
    score: 0,
    gameOver: false,
};

let gameInterval = null;

// Reset game state
function resetGameState() {
    console.log('Resetting game state.');
    gameState = {
        ball: { x: 250, y: 250, vx: 2, vy: 3 },
        paddle: { x: 200, width: 100 },
        score: 0,
        gameOver: false,
    };
}

// Broadcast game state
function broadcastGameState() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'gameState', gameState }));
        }
    });
}

// Start the game
function startGame() {
    console.log('Game started!');
    resetGameState();
    broadcastGameState();

    if (gameInterval) clearInterval(gameInterval);

    gameInterval = setInterval(() => {
        if (!gameState.gameOver) {
            // Update ball position
            gameState.ball.x += gameState.ball.vx;
            gameState.ball.y += gameState.ball.vy;

            // Wall collisions
            if (gameState.ball.x <= 0 || gameState.ball.x >= 500) {
                gameState.ball.vx *= -1;
            }
            if (gameState.ball.y <= 0) {
                gameState.ball.vy *= -1;
            }

            // Paddle collisions
            if (
                gameState.ball.y >= 480 &&
                gameState.ball.x >= gameState.paddle.x &&
                gameState.ball.x <= gameState.paddle.x + gameState.paddle.width
            ) {
                gameState.ball.vy *= -1;
                gameState.score += 1;
            }

            // Check for game over
            if (gameState.ball.y > 500) {
                gameState.gameOver = true;
            }

            broadcastGameState();
        } else {
            console.log('Game over!');
            broadcastGameState();
            clearInterval(gameInterval);
        }
    }, 16);
}

// WebSocket connections
// Update paddle position on paddleMove
wss.on('connection', (ws) => {
    console.log('New connection established.');

    ws.on('message', (message) => {
        const clientData = JSON.parse(message);

        if (clientData.type === 'paddleMove') {
            gameState.paddle.x = Math.max(0, Math.min(400, clientData.paddleX)); // Ensure paddle stays within bounds
            broadcastGameState(); // Update all clients with the new paddle position
        }

        if (clientData.type === 'startGame') {
            startGame();
        }
    });

    ws.on('close', () => {
        console.log('Connection closed.');
    });
});

// Serve static files
app.use(express.static('public'));

// Start server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
