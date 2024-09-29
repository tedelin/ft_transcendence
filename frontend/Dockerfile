FROM node:22-alpine as base

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

FROM base AS build
COPY . .
RUN npm run build

FROM base as dev
EXPOSE 3000
CMD npm run dev

FROM nginx:1.27-alpine as prod
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/ft_transcendence.conf /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]