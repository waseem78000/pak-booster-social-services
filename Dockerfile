FROM oven/bun:latest

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN bun x prisma generate

# Copy source code
COPY . .

# Build frontend
RUN bun run build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["bun", "run", "start"]
