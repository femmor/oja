# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
COPY admin/package.json /temp/dev/admin/
COPY backend/package.json /temp/dev/backend/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
COPY admin/package.json /temp/prod/admin/
COPY backend/package.json /temp/prod/backend/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build stage
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/dev/admin/node_modules admin/node_modules
COPY --from=install /temp/dev/backend/node_modules backend/node_modules
COPY . .

# Build the admin frontend
RUN bun run build:admin

# Build the backend (if needed)
RUN bun run build:backend

# Production stage
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/prod/admin/node_modules admin/node_modules
COPY --from=install /temp/prod/backend/node_modules backend/node_modules
COPY --from=build /usr/src/app/admin/dist admin/dist
COPY --from=build /usr/src/app/backend/dist backend/dist
COPY --from=build /usr/src/app/backend/src backend/src
COPY --from=build /usr/src/app/package.json .

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --eval "fetch('http://localhost:8080/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application
USER bun
CMD ["bun", "start"]