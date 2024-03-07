# Build stage
FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

EXPOSE 8000

CMD ["yarn", "start:prod"] 
