FROM node:22-alpine as base
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN pnpm install

FROM base AS prod
ENV NODE_ENV=production
COPY . .
RUN npx prisma generate
RUN pnpm run build
EXPOSE 3001
CMD npx prisma migrate deploy && node dist/main

FROM base AS dev
EXPOSE 3001
CMD pnpm prisma generate && pnpm prisma migrate deploy && pnpm run start:dev & pnpm prisma studio --port 5555
