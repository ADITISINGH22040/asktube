FROM node:20-slim AS buildContainer

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

WORKDIR /install

COPY package*.json tsconfig.json ./

RUN npm ci --no-progress

COPY . .

ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM node:20-slim AS final

ENV NODE_ENV=production

WORKDIR /usr/src/app

USER node

COPY --from=buildContainer --chown=node:node /install/dist ./
COPY --from=buildContainer --chown=node:node /install/node_modules ./node_modules

CMD ["node", "src/main.js"]
