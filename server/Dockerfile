FROM node:16-alpine

WORKDIR /usr

COPY package.json yarn.lock server/tsconfig.json  ./

COPY server/ ./server/

RUN yarn --frozen-lockfile
RUN yarn server:build

## this is stage two , where the app actually runs

FROM node:16-alpine

WORKDIR /usr

COPY package.json yarn.lock ./

RUN yarn --prod --frozen-lockfile

COPY --from=0 /usr/server/dist ./server/dist

EXPOSE 8080

CMD ["yarn","server:start"]