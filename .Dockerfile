FROM node:10.16.3 as builder

# Init
WORKDIR /usr/src/app
RUN npm i -g yarn
COPY package*.json ./
COPY yarn* ./
RUN yarn

COPY . .

ENV PORT=80
EXPOSE 80
ENTRYPOINT ["yarn", "start"]
