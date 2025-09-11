# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /usr/src/app

# Install global packages
RUN npm install -g npm@11.2.0
RUN npm install -g vite

# Create and set ownership of directories
RUN mkdir -p /usr/src/app/node_modules && \
    chown -R node:node /usr/src/app

# Switch to non-root user for all subsequent operations
USER node

# Copy package files with proper ownership
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install @rollup/rollup-linux-x64-musl --no-save
RUN npm install

# No need to copy the rest of the source files here
# They will be mounted via the volume in docker-compose

# Expose Vite's default dev port
EXPOSE 5173

# Run Vite dev server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]