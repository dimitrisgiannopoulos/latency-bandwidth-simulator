# Stage 1: Build
FROM node:lts-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .

# Stage 2: Production
FROM node:lts-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
EXPOSE 3000
CMD [ "node", "server.js" ]
