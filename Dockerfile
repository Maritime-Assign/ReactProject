# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies

RUN npm install -g npm@11.2.0

COPY package.json package-lock.json ./

RUN npm install @rollup/rollup-linux-x64-musl --no-save
RUN npm install 
RUN npm install -g vite

# Copy the rest of the source files
COPY . .

# Change ownership of all files to node user
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose Vite's default dev port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev"]