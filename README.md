
# Latency and Bandwidth Simulator

This project provides a real-time WebSocket-based game application designed to simulate network latency and bandwidth conditions. It includes a client application and a server to measure latency and test various payload sizes under simulated conditions.

## Features

- **WebSocket Communication**: Real-time communication between the client and server.
- **Latency Measurement**: Measures round-trip latency using WebSocket `ping-pong` messages.
- **Payload Simulation**: Adjust the payload size dynamically to simulate light, medium, heavy, or no payloads.
- **Stop/Restart Game**: Allows stopping and restarting the game for testing purposes.
- **Responsive Design**: A canvas-based game playable in a web browser.
- **Configurable WebSocket Server**: Runs in a containerized environment for easy deployment.

## Setup and Usage

### Prerequisites

1. **Docker**: Install Docker to build and run the container.
2. **Node.js**: Required for local development.
3. **AWS ECS** (optional): For deploying the server in the cloud.

### Clone the Repository

```bash
git clone https://github.com/dimitrisgiannopoulos/latency-bandwidth-simulator.git
cd latency-bandwidth-simulator
```

### Running Locally

#### Using Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node server.js
   ```
3. Open your browser at `http://localhost:3000`.

#### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t dimitrisgian/latency-bandwidth-simulator .
   ```
2. Run the Docker container:
   ```bash
   docker run -it --rm -p 3000:3000 dimitrisgian/latency-bandwidth-simulator
   ```
3. Open your browser at `http://localhost:3000`.

### Payload Slider Settings

The application includes a payload slider with the following options:

- **No Payload**: Simulates zero additional payload in the client's and server's messages.
- **Light**: Sends a payload of about 100 KB in the client's and about 2 MB in the server's messages.
- **Medium**: Sends a payload of about 500 KB in the client's and about 5 MB in the server's messages.
- **Heavy**: Sends a payload of about 1 MB in the client's and about 10 MB in the server's messages.

Adjusting the slider updates the payload size dynamically during gameplay. The reason, is to simulate heavier applications, which normally send heavier payloads.

## Starting the Game

- **Start Game**: Use the "Start Game" button to connect and start the game.

## Measuring Latency

The application measures round-trip time (RTT) as the latency:

1. The client sends a `ping` message with a timestamp.
2. The server responds with a `pong` message.
3. The client calculates latency as the time difference between sending and receiving the messages.

## Known Issues

- High payload sizes (e.g., Heavy) may lead to increased CPU usage and browser lag.

## License

This project is open-source and available under the [Apache 2.0 License](LICENSE).
