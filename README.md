# University of Washington - IDCardWS/PWS/GroupsWS POC

This is a work in progress.  The goal of this project is to accept a magstrip/rfid from a Husky Card and add the user to a UW Group for attendance purposes.

Requires a UWCA certificate to authenticate with webservices, which must be authorized by the registrar.  With this comes the responsibility to properly secure this application.

This project is also intended to be a reference on how to use various APIs, see src/models for the various APIs as examples.

## Current Features
- PWS Integration
- IDCardWS Integration
- Base64 Photo
- GroupsWS API
- PWS API
- IDCardWS API

## Future
- Frontend Application

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

## Config File
```
{
	"port": 1111,
	"bodyLimit": "100kb",
	"corsHeaders": ["Link"],
	"certificate": "config/cert.pfx", # certificate location
    "passphrase": "", # certificate password
	"idcardBaseUrl": "https://wseval.s.uw.edu/idcard/v1/card.json",
	"pwsBaseUrl": "https://wseval.s.uw.edu/identity/v2/person/",
	"photoBaseUrl": "https://wseval.s.uw.edu/idcard/v1/photo/",
	"groupsBaseUrl": "https://groups.uw.edu:7443/group/",
	"storeInGroupsWS": true, # store users in memory or persist to UW Group?
	"groupAdmins": ["admin"], # when creating a new group, who should be the admins?
    "groupDisplayName": "UW Registration POC",
	"groupDescription": "This a test group for UW Registration POC",
	"groupNameBase": "uw_ais_sm_ews_idcardpoc_", # the base group your cert is subgroup-creator on
	"groupNameLeaf": "test", # the subgroup to be created
	"enableRegisterAPI": true,
    "enableGroupsAPI": false,
    "enablePWSAPI": false,
    "enableIDCardAPI": false,
    "registerListVerbose": false    
}
```