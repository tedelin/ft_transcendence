FROM node:21-alpine3.18

WORKDIR /usr/ft_transcendence

COPY ./package*.json ./

RUN npm install

EXPOSE 3001

CMD npx prisma generate && npx prisma migrate dev --name init && npm run start:dev & npx prisma studio --port 5555
