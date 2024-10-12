# Stage 1: Build Stage
FROM node:21-alpine AS build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Production Stage
FROM node:21-alpine AS production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install PostgreSQL client
RUN apk --no-cache add postgresql-client

# Install bash and wait-for-it script
RUN apk --no-cache add bash \
    && wget -O /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /usr/local/bin/wait-for-it.sh

# Copy built assets from the build stage
COPY --from=build /usr/src/app .

# Create uploads directory if it doesn't exist and set permissions
RUN mkdir -p /usr/src/app/public/uploads && chown -R www-data:www-data /usr/src/app/public/uploads

# Start PostgreSQL client and wait for it to be ready, then run the app
CMD ["sh", "-c", "pg_isready -h postgres && npm run start"]
