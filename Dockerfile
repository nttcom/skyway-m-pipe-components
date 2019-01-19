FROM node:8.12-alpine as builder

RUN apk update \
  && apk add --update \
       git \
       openssh \
       openssh-client \
       pkgconfig \
       ca-certificates

# App
WORKDIR /app
COPY ./package.json /app/package.json
COPY ./yarn.lock    /app/yarn.lock
COPY ./components   /app/components
RUN yarn install


FROM node:8.9-alpine

COPY --from=builder /app /app

RUN apk add --update --no-cache \
       tini

WORKDIR /app
ENTRYPOINT ["/sbin/tini", "node"]
