# Use Node.js LTS image
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the application
COPY . .

# Use a lightweight production stage
FROM node:lts-alpine

WORKDIR /usr/src/app

# Copy files from the builder stage
COPY --from=builder /usr/src/app .

# Expose the port and start the application
EXPOSE 3000
CMD [ "node", "server.js" ]
