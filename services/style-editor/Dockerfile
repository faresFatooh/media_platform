# 1. Use an official Node.js runtime
FROM node:18-alpine

# 2. Set the working directory
WORKDIR /app

# --- Backend Dependencies ---
# 3. Copy server's package file first
COPY server/package*.json ./server/
# 4. Install server dependencies
RUN npm install --prefix server

# --- Frontend Dependencies ---
# 5. Copy frontend's package file
COPY package*.json ./
# 6. Install frontend dependencies
RUN npm install

# 7. Copy the rest of the project code
COPY . .

# 8. Expose the port the frontend runs on
EXPOSE 3000

# 9. The final command to run both frontend and server
CMD ["npm", "run", "dev"]