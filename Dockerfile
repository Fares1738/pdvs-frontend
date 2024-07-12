# Use a newer version of Node.js Alpine as base image
FROM node:18-alpine

# Install git (if needed for your dependencies)
RUN apk add --no-cache git

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm cache clean --force && npm install --legacy-peer-deps

# Copy the rest of your application code
COPY . .

# Build your Next.js application
RUN npm run build

# Expose the port Next.js runs on (usually 3000)
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "run", "dev"]
