# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install 

COPY . .

# Build the TypeScript code into JavaScript
RUN npm run build

# Expose the application port (adjust to your server's port, usually 3000)
EXPOSE 3000

# Start the application using the compiled JavaScript code
CMD ["npm", "start"]
