FROM node:21-alpine3.18

WORKDIR /usr/ft_transcendence

COPY package*.json ./ 

EXPOSE 3001

CMD npm install && npx prisma generate && npx prisma migrate dev && npm run start:dev & npx prisma studio --port 5555