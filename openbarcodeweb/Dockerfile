FROM node:lts AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx expo build:web

FROM nginx:alpine

COPY --from=build /app/web-build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
