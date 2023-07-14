FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
COPY build ./

RUN yarn install --frozen-lockfile
# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "yarn", "serve", "-s", "build", "-l", "8080" ]