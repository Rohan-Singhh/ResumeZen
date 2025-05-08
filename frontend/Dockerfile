FROM node:18

# Set working dir
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy all
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev", "--", "--host"]
