FROM node:22-alpine as base
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

FROM base AS prod
ENV NODE_ENV=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD npx prisma migrate deploy && node dist/main

FROM base AS dev
EXPOSE 3001
CMD npx prisma generate && npx prisma migrate deploy && npm run start:dev & npx prisma studio --port 5555