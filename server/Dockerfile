# Use official Node image
FROM node:20-alpine

# Create app folder inside container
WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm install --production

# Copy the rest of the server code
COPY . .

# Make sure uploads folder exists inside container
RUN mkdir -p uploads

# Env
ENV NODE_ENV=production
ENV PORT=6969

# Expose port
EXPOSE 6969

# Start the server
CMD ["npm", "start"]
