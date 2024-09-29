FROM node:22-alpine as base

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

FROM base AS prod
EXPOSE 3001
COPY . .
RUN npx prisma generate
RUN npx prisma migrate dev --name init
RUN npm run build
ENV NODE_ENV=production
CMD node dist/main

FROM base AS dev
EXPOSE 3001
CMD npx prisma generate && npx prisma migrate dev --name init && npm run start:dev & npx prisma studio --port 5555