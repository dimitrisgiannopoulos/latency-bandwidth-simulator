# latency-bandwidth-simulator

## Description
This repository hosts a simple web application designed to simulate latency and bandwidth usage in a real-world application scenario. The app allows users to interact with a frontend UI that initiates a server communication process. It dynamically showcases the impact of latency and bandwidth usage on user interactions, providing an educational and illustrative tool for demonstrating network performance.

## Features
- **Dynamic Interaction**: A slider to choose between "Light," "Medium," and "Heavy" AR app simulations, which adjusts the transmitted and received data size.
- **RTT Display**: Displays the round-trip time (RTT) in milliseconds, refreshing every second.
- **Color Feedback**: The app dynamically changes its color based on server responses, ensuring visual appeal while maintaining readability.
- **Bandwidth Simulation**: Sends and receives payloads sized to mimic AR application data requirements.
- **Dockerized Deployment**: Includes a Dockerfile for easy containerization and deployment.

## How to Run Locally

### Prerequisites
1. **Node.js**: Install the latest LTS version from [Node.js](https://nodejs.org/).
2. **Docker** (Optional): Install Docker from [Docker's official website](https://www.docker.com/).

### Steps to Run
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/latency-bandwidth-simulator.git
   cd latency-bandwidth-simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Running with Docker
1. Build the Docker image:
   ```bash
   docker build -t latency-bandwidth-simulator .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 latency-bandwidth-simulator
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use
1. **Select AR Level**: Use the slider to choose between "Light," "Medium," and "Heavy" levels. This determines the size of the data transmitted and received.
2. **Simulate Interaction**: Click the "Simulate" button to send a request to the server and see the RTT displayed in milliseconds.
3. **Observe Bandwidth and Latency Effects**: Notice the page's color changing and the RTT display, indicating server communication and response times.

## Technical Details
- **Frontend**: HTML, CSS, and JavaScript for user interaction and dynamic updates.
- **Backend**: Node.js with Express.js to handle server requests and simulate payload responses.
- **Payload Sizes**:
  - Light: 2 MB
  - Medium: 5 MB
  - Heavy: 10 MB

## License
This project is licensed under the Apache 2.0 License. See the `LICENSE` file for details.
