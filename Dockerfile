# ---- Base Node ----
FROM node:10.4.1-alpine AS base
RUN apk add --no-cache nodejs-current tini
WORKDIR /www
# Set tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]
# copy project file
COPY package.json .

# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install
COPY . .
# build the project
RUN npm run build

# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /www/prod_node_modules /www/node_modules

# copy only the things we need for production
COPY --from=dependencies /www/dist /www/dist
COPY --from=dependencies /www/bin /www/bin
COPY --from=dependencies /www/config_base /www/config_base

EXPOSE 1111
CMD npm start