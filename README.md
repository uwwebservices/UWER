# University of Washington - IDCardWS/PWS/GroupsWS POC

This is a work in progress.  The goal of this project is to accept a magstrip/rfid from a Husky Card and add the user to a UW Group for attendance purposes.

Requires a UWCA certificate to authenticate with webservices, which must be authorized by the registrar.  With this comes the responsibility to properly secure this application.

## Current Features
- PWS Integration
- IDCardWS Integration
- Base64 Photo
- GroupsWS API

## Future
- Frontend Application
- PWS API
- IDCardWS API

## Setup
1. Copy config.json.example to config.json
2. Add certificate to src/cert.pfx and add passphrase to config.json
3. Add your groups base to config.json, your certificate must be "Subgroup creator" role on this group
4. Add certs/users to config.admins (likely want yourself and your cert added)
5. npm install
6. npm run dev

## API Endpoints

### Registration
GET /api/register/list - List members in configured group  
PUT /api/register/:cardNum - Add cardNum (rfid/magstrip) to configured group  
DELETE /api/register/:netid - Remove member from group by netid

### GroupsWS
GET /api/groups/:groupName - List users in groupName  
PUT /api/groups/:groupName/:netid - Add netid to groupName  
DELETE /api/groups/:groupName/:netid - Remove netid from groupname  
DELETE /api/groups/:groupName - Remove the group from GroupsWS  

### PWS
GET /api/pws/:regId - Returns the full PWS listing for the regId  

### IDCardWS
GET /api/idcard/:cardNum - Returns RegID for given cardNum (rfid/magstrip)  
GET /api/idcard/photo/:regId - Returns a base64 image for a regId