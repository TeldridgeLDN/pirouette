# Pirouette Railway Analysis Worker Dockerfile
# Based on Playwright's official image for browser automation

FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Install Playwright browsers (Chromium only)
RUN npx playwright install chromium

# Build TypeScript
RUN npm run build

# Expose port for health checks
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["npm", "start"]

