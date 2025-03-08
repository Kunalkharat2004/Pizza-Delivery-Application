# Stage-1: Build the application
FROM node:22.11.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage-2: Create the production image
FROM node:22.11.0-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY --from=builder /app/dist ./
EXPOSE 3200
CMD ["node", "src/server.js"]