FROM node:lts AS build

WORKDIR /app

COPY openbarcodeweb/package*.json ./
RUN npm install

COPY openbarcodeweb/ . 
RUN npx expo build:web

# Second stage: Nginx for serving
FROM nginx:alpine

COPY --from=build /app/web-build /usr/share/nginx/html
COPY openbarcodeweb/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
