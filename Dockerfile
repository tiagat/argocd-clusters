FROM node:20.12.2-alpine AS builder

RUN mkdir -p /opt/app/
COPY package.json package-lock.json .env.example tsconfig.json tsconfig.build.json /opt/app/
COPY src /opt/app/src/

WORKDIR /opt/app/

RUN npm ci --ignore-scripts
RUN npm run build

FROM node:20.12.2-alpine

COPY package.json package-lock.json /opt/app/
WORKDIR /opt/app/
RUN npm ci --omit=dev --ignore-scripts
COPY .env.example /opt/app/
COPY --from=builder /opt/app/dist/ dist/

ENTRYPOINT ["node", "/opt/app/dist/index.js"]
