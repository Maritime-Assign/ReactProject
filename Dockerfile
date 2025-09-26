# syntax=docker/dockerfile:1

# --- Base image ---
# Use official Node.js Alpine image (small footprint)
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

# --- System dependencies ---
# Add build tools required for native npm modules
RUN apk add --no-cache python3 make g++

# --- App workspace ---
# Set working directory for the application
WORKDIR /usr/src/app

# --- Global npm tools ---
# Update npm to a known version and install Vite globally for dev
RUN npm install -g npm@11.2.0 vite

# --- Dependencies ---
# Copy package manifests first (cache layer) then install
COPY package*.json ./
RUN npm install

# --- Permissions ---
# Create node_modules directory and set ownership 
# Avoid recursive chown to prevent Docker stalls
RUN mkdir -p /usr/src/app/node_modules && \
    chown node:node /usr/src/app/node_modules

# --- Non-root runtime ---
# Run app as the "node" user for safety
USER node

# --- Ports ---
# Expose Vite dev server port
EXPOSE 5173

# --- Default command ---
# Start Vite dev server with host flag for external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
