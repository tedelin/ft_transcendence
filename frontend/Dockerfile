FROM node:21-alpine3.18

WORKDIR /usr/ft_transcendence

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]