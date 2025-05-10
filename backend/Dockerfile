# Use Node 18 base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy only package.json and lock file first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the code
COPY . .

# Expose backend port (adjust if not 5000)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
