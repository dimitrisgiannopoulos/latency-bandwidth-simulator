const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

const updateInterval = 16; // 60 FPS
const syncInterval = 500; // State sync every 500ms

let gameState = {
    ball: { x: 250, y: 250, vx: 2, vy: 3 },
    paddle: { x: 200, width: 100 },
    score: 0,
    gameOver: false,
};

let gameInterval = null;
let lastSyncTime = 0;

// Padding levels
const paddingLevels = {
    NoPadding: 0,          // No padding
    Light: 0.5 * 1024 * 1024,  // 500 KB
    Medium: 1 * 1024 * 1024, // 1 MB
    Heavy: 2.5 * 1024 * 1024  // 2.5 MB
};

const paddingCache = {
    NoPadding: '',
    Light: 'X'.repeat(paddingLevels.Light),
    Medium: 'X'.repeat(paddingLevels.Medium),
    Heavy: 'X'.repeat(paddingLevels.Heavy),
};

let selectedPaddingLevel = 'NoPadding';

function resetGameState() {
    gameState = {
        ball: { x: 250, y: 250, vx: 2, vy: 3 },
        paddle: { x: 200, width: 100 },
        score: 0,
        gameOver: false,
    };
}

function broadcastGameState() {
    const now = Date.now();
    const gameStateMessage = `DATA:${JSON.stringify({ type: 'gameState', gameState })}`;
    const isSyncTime = now - lastSyncTime >= syncInterval;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(gameStateMessage); // Send game state

            if (isSyncTime) {
                lastSyncTime = now;
                const padding = paddingCache[selectedPaddingLevel];
                if (padding.length > 0) {
                    client.send(`PADDING:${padding}`);
                }
            }
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
    }, updateInterval);
}

wss.on('connection', (ws) => {
    console.log('New connection established.');

    ws.on('message', (message) => {
        const messageString = message.toString(); // Convert Buffer to string

        // Ignore padding messages
        if (messageString.startsWith('PADDING:')) {
            return;
        }

        // Handle messages with `DATA:` prefix
        if (messageString.startsWith('DATA:')) {
            try {
                const data = JSON.parse(messageString.slice(5)); // Remove `DATA:` prefix and parse
                if (data.type === 'paddleMove') {
                    const direction = data.direction;
                    gameState.paddle.x = Math.max(
                        0,
                        Math.min(400, gameState.paddle.x + direction * 20)
                    );
                    broadcastGameState();
                } else if (data.type === 'startGame') {
                    startGame();
                } else {
                    console.warn('Unknown DATA message type:', data);
                }
            } catch (err) {
                console.error('Invalid DATA message:', messageString, err);
            }
            return;
        }

        // Handle JSON messages like ping or updatePadding
        try {
            const data = JSON.parse(messageString);
            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong', time: data.time }));
            } else if (data.type === 'updatePadding') {
                selectedPaddingLevel = data.level || 'NoPadding';
                console.log(`Updated padding level to: ${selectedPaddingLevel}`);
            } else {
                console.warn('Unknown JSON message received:', data);
            }
        } catch (err) {
            console.error('Unrecognized message format:', messageString, err);
        }
    });

    ws.on('close', () => console.log('Connection closed.'));
});

app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
