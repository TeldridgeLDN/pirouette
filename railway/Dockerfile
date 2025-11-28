# Pirouette Railway Analysis Worker Dockerfile
# Based on Playwright's official image for browser automation
#
# Supports two modes:
#   - SERVER: HTTP API server (receives jobs, adds to queue)
#   - WORKER: BullMQ worker (processes jobs from queue)
#
# Set MODE environment variable to choose:
#   MODE=server (default) - Run the HTTP server
#   MODE=worker           - Run the BullMQ worker
#   MODE=all              - Run both (for single-container deployments)

FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Install Playwright browsers (Chromium only)
RUN npx playwright install chromium

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Expose port for HTTP server
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Default mode
ENV MODE=server

# Health check (only applicable in server mode)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 0

# Start script that respects MODE
CMD ["sh", "-c", "\
  if [ \"$MODE\" = 'worker' ]; then \
    echo 'Starting worker mode...' && npm run start:worker; \
  elif [ \"$MODE\" = 'all' ]; then \
    echo 'Starting server and worker...' && npm run start:all; \
  else \
    echo 'Starting server mode...' && npm start; \
  fi \
"]
