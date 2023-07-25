FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY build ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 8080
CMD [ "yarn", "serve", "-s", "build", "-l", "8080" ]