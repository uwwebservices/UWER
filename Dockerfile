# ---- Dependencies ----
FROM node:9-alpine AS deps
WORKDIR /www
COPY . .
# install node packages
RUN npm set progress=false && npm config set depth 0
# install ALL node_modules, including 'devDependencies'
RUN npm install
# build the project
RUN npm run build

# ---- Release ----
FROM node:9-alpine
RUN apk add --no-cache nodejs-current tini
WORKDIR /www
ENTRYPOINT ["/sbin/tini", "--"]
# install only production dependencies
RUN npm install --only=production
COPY package.json /www
COPY --from=deps /www/dist /www/dist
COPY --from=deps /www/bin /www/bin
COPY --from=deps /www/config_base /www/config_base

EXPOSE 1111
CMD npm run prod