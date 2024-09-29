# Base stage: install pnpm and dependencies
FROM node:22-alpine as base
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm install -g pnpm
WORKDIR /app
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN pnpm install

FROM base AS build
COPY . .
RUN pnpm run build

FROM base AS dev
EXPOSE 3000
CMD pnpm run dev

FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/ft_transcendence.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
