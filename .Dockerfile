FROM node:10.16.3 as builder

# Init
WORKDIR /usr/src/app
RUN npm i -g yarn
RUN yarn
COPY package*.json ./

# Build
COPY . .
RUN yarn build

FROM nginx:1.16.1-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/* /etc/nginx/
COPY build /var/source

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
