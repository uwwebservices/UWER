# ---- Base Node ----
FROM alpine:3.5 AS base
RUN apk add --no-cache nodejs-current tini
WORKDIR /dist
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

# ---- Test ----
# run tests, image is not built if tests fail
FROM dependencies AS test
COPY . .
RUN sh ./scripts/config.sh
RUN npm run test

# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /dist/prod_node_modules ./node_modules
# copy app sources
COPY . ./dist

EXPOSE 1111
CMD npm run start