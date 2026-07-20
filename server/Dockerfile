FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build

EXPOSE 5000

CMD npx prisma migrate deploy --schema=src/prisma/schema.prisma && npm run start
