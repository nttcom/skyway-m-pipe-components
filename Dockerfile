FROM node:10.15-alpine as builder

RUN apk update \
  && apk add --update \
       git \
       pkgconfig

# App
WORKDIR /app
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./components   /app/components
RUN npm install --production


FROM node:10.15-alpine

COPY --from=builder /app /app

RUN apk add --update --no-cache \
       tini

WORKDIR /app
ENTRYPOINT ["/sbin/tini", "node"]
