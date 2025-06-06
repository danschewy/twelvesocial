# 1. Base image: Use a Node.js LTS version
FROM --platform=linux/amd64 node:20-alpine AS base
RUN corepack enable
# 2. Set working directory
WORKDIR /app
# 3. Copy package.json and yarn.lock (or package-lock.json)
# Assuming yarn is used due to no package-lock.json in common files
COPY package.json yarn.lock* ./

# 4. Install dependencies
# Use --frozen-lockfile to ensure reproducible builds
RUN yarn install --frozen-lockfile

# 5. Copy the rest of the application code
COPY . .

# 6. Build the Next.js application
# This will also pick up any build-time environment variables if they are passed as ARGs
# For NEXT_PUBLIC_ variables needed at build time:
# ARG NEXT_PUBLIC_SOME_VAR
# ENV NEXT_PUBLIC_SOME_VAR=$NEXT_PUBLIC_SOME_VAR
RUN yarn build

# 7. Production image
FROM node:20-alpine AS production

WORKDIR /app

# Install FFmpeg
RUN apk update && apk add --no-cache ffmpeg

# Copy built assets from the base stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/yarn.lock* ./yarn.lock*
COPY --from=base /app/next.config.ts ./next.config.ts

# Install production dependencies. The `next` command comes from here.
RUN yarn install --production --frozen-lockfile

# 8. Set environment variables
ENV NODE_ENV=production
# The PORT environment variable is used by Next.js to bind to a specific port.
# It defaults to 3000 if not set.
ENV PORT=3000

# Runtime Environment Variables (to be set during `docker run` for sensitive data)
# ENV OPENAI_API_KEY=
# ENV TWELVE_LABS_API_KEY=
# ENV TWELVE_LABS_INDEX_ID=
# 9. Expose the port the app runs on
EXPOSE 3000

# 10. Command to run the application
# next start uses the .next build output
CMD ["npm", "start"]

# Note on Environment Variables:
# - For sensitive variables (API keys), pass them at runtime using `docker run -e VAR=value ...`.
#   The Dockerfile includes placeholder ENV lines that will be overridden if you pass them at runtime.
# - For build-time variables (e.g., NEXT_PUBLIC_...), use ARG before the build stage and ENV to bake them in.
#   Example for this is shown commented out in the 'base' stage before `RUN yarn build`. 
