# University of Washington - IDCardWS/PWS/GroupsWS POC

This is a work in progress.  The goal of this project is to accept a magstrip/rfid from a Husky Card and add the user to a UW Group for attendance purposes.

Requires a UWCA certificate to authenticate with webservices, which must be authorized by the registrar.

## Current Features
- PWS Integration
- IDCardWS Integration
- Base64 Photo
- GroupsWS API

## Future
- Support Authorization Tokens
- Frontend Application

## API Endpoints

### Registration
GET /api/register/list - List members in configured group 
PUT /api/register/:cardNum - Add cardNum (rfid/magstrip) to configured group 

### GroupsWS
GET /api/groups/:groupName - List users in groupName 
PUT /api/groups/:groupName/:netid - Add netid to groupName 
DELETE /api/groups/:groupName/;netid - Remove netid from groupname 
