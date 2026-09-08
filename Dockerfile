FROM oven/bun:latest

WORKDIR /app

# Default DATABASE_URL — Render can override in env vars
ENV DATABASE_URL=file:./dev.db

# Copy dependency files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN bun x prisma generate

# Copy everything else
COPY . .

# Build frontend
RUN bun run build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

# At runtime: push tables to DB, then start server
CMD ["sh", "-c", "bun x prisma db push --accept-data-loss 2>&1; bun run server.tsx"]
