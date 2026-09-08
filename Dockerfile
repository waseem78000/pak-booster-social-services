FROM oven/bun:latest

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy Prisma schema and generate client + push tables
COPY prisma ./prisma
RUN bun x prisma generate
RUN bun x prisma db push --skip-generate

# Copy everything else
COPY . .

# Build frontend
RUN bun run build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

# Seed + start
CMD ["sh", "-c", "bun x prisma db push --skip-generate && bun run server.tsx"]
