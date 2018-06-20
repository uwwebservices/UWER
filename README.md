# Event Registration [![Build Status](https://travis-ci.org/uwwebservices/idcard-webapp-poc.svg?branch=master)](https://travis-ci.org/uwwebservices/idcard-webapp-poc)

Project to demonstrate an event registration application.  The idea being, with this application and some minimal setup you can deploy 
to a device (desktop/laptop/Raspberry Pi/etc.) capable of running node.js and take attendance via card swipes (magstripe/rfid). Submitting a huskycard rfid/magstrip/netid looks up users regid and passes to PWS to get more user details, and adds users to a UW Group leaf.  After collecting users a list of registered users in plain/verbose format
can be returned as well as the UW group will have the member list or download a list as a CSV.  Verbose output from the API includes various user information as well as
a base64 encoded image from their husky card.

## Requirements
- UWCA x509 certificate, authorized for IDCard/PWS/Groups
- node.js and npm/yarn
- [optional] docker/docker-compose
- [optional] card magstrip/rfid reader

## Current Features
- PWS/GroupsWS/IDCard APIs
- Register users to a UWGroup or memory store
- Full RESTful API
- Dev environment hot reloading for server and frontend
- Dockerhub integration
- Frontend to show usage possibilities

## Docker-Compose Install
```
version: '3'
services:
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
GET /api/register[?verbose=[0-2]] - List members in configured group
PUT /api/register/:identifier - Add cardNum (rfid/magstrip/netid) to configured group  
DELETE /api/register/:netid - Remove member from group by netid

### GroupsWS
GET /api/groups/:groupName - List users in groupName  
GET /api/groups/:groupName/check - Check if group exists
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
