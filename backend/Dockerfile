FROM node:21-alpine3.18

WORKDIR /usr/ft_transcendence

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]