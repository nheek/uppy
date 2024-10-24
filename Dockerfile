FROM node:21-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:21-alpine AS production
WORKDIR /usr/src/app
RUN apk --no-cache add postgresql-client
RUN apk --no-cache add bash \
    && wget -O /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /usr/local/bin/wait-for-it.sh
COPY --from=build /usr/src/app .
CMD ["sh", "-c", "pg_isready -h postgres && npm run start"]