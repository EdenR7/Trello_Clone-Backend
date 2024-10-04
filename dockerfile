# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the application port (adjust to your server's port, usually 3000)
EXPOSE 3000

# Start the application using the compiled code in the dist folder
CMD ["node", "dist/index.js"]
