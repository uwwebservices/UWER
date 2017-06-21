# University of Washington - Event Registration

Work in progress project to demonstrate an event registration application.  The idea being, with this application and some minimal setup you can deploy 
to a device (desktop/laptop/Raspberry Pi/etc.) capable of running node.js and easily take attendance via card swipes. Submitting a huskycard rfid/magstrip looks up users regid, 
passes to PWS to get more user details, and adds users to a UW Group leaf.  After collecting users a list of registered users in plain/verbose format
can be returned as well as the UW group will have the member list.  Verbose output from the API includes various user information as well as
a base64 encoded image from their husky card.

This project is also intended to be a reference on how to use various APIs, see src/models for the various APIs as examples.

## Requirements
- UWCA x509 certificate, authorized for IDCard/PWS/Groups
- node.js and npm/yarn
- [optional] docker/docker-compose
- [optional] card magstrip reader

## Current Features
- PWS/GroupsWS/IDCard APIs
- Register users to a UWGroup or memory store
- Full RESTful API
- Dev environment hot reloading for server and frontend
- Dockerhub integration

## Docker-Compose Install
```
  idcard:
    image: uwwebservices/idcard-webapp-poc
    volumes:
      - /path/to/storage:/www/dist/config
    ports:
      - "1111:1111"
```

## Dev Setup
1. Copy config.json.example to config.json and update as necessary
2. Add cert.pfx to config directory or wherever config.json references
3. npm install && npm run dev

## Commands

1. npm run dev -> start development server
2. npm run build -> build project
3. npm start -> build project and start in production mode
4. npm test -> run eslint on src

## API Endpoints

### Registration
GET /api/register[?verbose=true] - List members in configured group (verbose or simple)  
PUT /api/register/:cardNum - Add cardNum (rfid/magstrip) to configured group  
DELETE /api/register/:netid - Remove member from group by netid

### GroupsWS
GET /api/groups/:groupName - List users in groupName  
PUT /api/groups/:groupName/:netid - Add netid to groupName  
DELETE /api/groups/:groupName/:netid - Remove netid from groupname  
DELETE /api/groups/:groupName - Remove the group from GroupsWS  

### PWS
GET /api/pws/:Id - Returns the full PWS listing for the regId or netId

### IDCardWS
GET /api/idcard/:cardNum - Returns RegID for given cardNum (rfid/magstrip)  
GET /api/idcard/photo/:regId - Returns a base64 image for a regId

## Technical Details
- nodemon for monitoring server file changes
- webpack-hot-middleware to monitor frontend file changes
- support for es6 and React transpiling
- cross-env for environment variables
- scripts/styles bundled in-memory (dev) and exported (prod)
- promises everywhere
- Dockerhub auto-generation (https://hub.docker.com/r/uwwebservices/idcard-webapp-poc/)