FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the frontend assets (dist folder)
RUN npm run build

# Expose the port your backend server runs on (usually 3000, 5000, or 8080)
EXPOSE 8080

# Run your backend server using ts-node or node (adjust based on your package.json script)
CMD ["npm", "run", "start"]