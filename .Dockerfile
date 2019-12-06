FROM node:10.16.3 as builder

WORKDIR /usr/src/app
RUN npm i -g yarn
COPY package*.json ./
COPY yarn* ./
RUN yarn
COPY . .
RUN yarn build

from nginx:1.17.6-alpine

COPY --from=builder ./usr/src/app/build/ /var/www/html/
COPY ./nginx/default.conf.template /etc/nginx/conf.d/
ENV NGINX_PORT=80
EXPOSE 80

ENTRYPOINT ["/bin/sh", "-c", "envsubst '${PROCESS_MANAGER_HTTP_BASEURL} ${EVENT_LOGGER_HTTP_BASEURL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
