import { Router } from 'express';
import Groups from 'models/groupModel';
import IDCard from 'models/idcardModel';
import PWS from 'models/pwsModel';
import { API } from 'Routes';
import { Certificate } from 'ews-api-lib';
import { authMiddleware, authOrTokenMiddleware, tokenMiddleware, baseMiddleware, getFullGroupName, idaaRedirectUrl, setDevModeCookie, uwerSetCookieDefaults } from '../utils/helpers';
import csv from 'csv-express'; // required for csv route even though shown as unused

let api = Router();

const IDAACHECK = process.env.IDAACHECK;
const IDAAGROUPID = process.env.IDAAGROUPID;
const s3Bucket = process.env.S3BUCKET;
const s3CertFile = process.env.S3CERTFILE;
const s3CertKeyFile = process.env.S3CERTKEYFILE;
const s3UWCAFile = process.env.S3UWCAFILE;
const s3IncommonFile = process.env.S3INCOMMONFILE;

Certificate.GetPFXFromS3(s3Bucket, s3CertFile, s3CertKeyFile, s3UWCAFile, s3IncommonFile).then(certificate => {
  certificate.ca = '';
  PWS.Setup(certificate);
  IDCard.Setup(certificate);
  Groups.Setup(certificate);
});

// Endpoint to check the registration token
// If the token is still valid, 200 is returned.
// If not valid, tokenMiddleware returns 401 Unauthroized.
api.get(API.CheckToken, tokenMiddleware, (req, res) => {
  return res.sendStatus(200);
});

api.get(API.GetMembers, authOrTokenMiddleware, async (req, res) => {
  const settings = req.signedCookies.registrationToken;
  let groupName = settings.groupName;
  let confidential = settings.confidential;
  let response = {
    groupName,
    confidential,
    members: []
  };

  if (confidential && !req.isAuthenticated()) {
    return res.status(200).json(response);
  }

  let groupMembers = await Groups.GetMembers(getFullGroupName(groupName));
  let members = await PWS.GetMany(groupMembers);
  let verbose = await IDCard.GetManyPhotos(groupName, members);
  response.members = verbose;
  return res.status(200).json(response);
});

api.put(API.RegisterMember, authOrTokenMiddleware, async (req, res) => {
  let { groupName, netidAllowed, confidential, privGrpVis } = req.signedCookies.registrationToken;
  let identifier = req.body.identifier;
  let validCard = IDCard.ValidCard(identifier);

  if (!validCard && !netidAllowed) {
    // invalid card, netid not allowed; alert the media
    return res.sendStatus(404);
  }

  if (validCard) {
    identifier = await IDCard.Get(validCard);
    identifier = (await PWS.Get(identifier)).UWNetID;
  }

  let added = await Groups.AddMember(groupName, identifier);
  if (!added) {
    result.sendStatus(500);
  } else {
    let user = await PWS.Get(identifier);
    user.displayId = req.body.displayId;
    user.Base64Image = await IDCard.GetOnePhoto(groupName, user.UWRegID);

    // Adjust the response if the group is confidential and we shouldn't show participants
    if (confidential && !privGrpVis) {
      user = {};
    }
    res.status(200).json(user);
  }
});

api.get(API.GetMemberPhoto, authOrTokenMiddleware, async (req, res) => {
  let image = await IDCard.GetPhoto(req.params.identifier);
  res.header('Content-Type', 'image/jpeg');
  return res.status(200).send(image);
});

api.get(API.GetToken, authMiddleware, async (req, res) => {
  const now = new Date();
  const user = req.user;
  const groupName = req.query.groupName;
  const privGrpVis = req.query.privGrpVis === 'true';
  const confidential = await Groups.IsConfidentialGroup(getFullGroupName(groupName));
  const netidAllowed = req.query.netidAllowed === 'true';
  const tokenTTL = req.query.tokenTTL;
  const expiry = now.setMinutes(now.getMinutes() + +tokenTTL);
  const token = { user, groupName, confidential, netidAllowed, privGrpVis, expiry };
  res.cookie('registrationToken', token, { ...uwerSetCookieDefaults, maxAge: +tokenTTL * 60 * 1000 });

  return res.sendStatus(200);
});

api.get(API.Logout, (req, res) => {
  req.logout();

  // loggedOut 'mode' doesn't delete the token; also used in development mode
  let loggedOut = req.query.loggedOut || false;
  if (!loggedOut) {
    setDevModeCookie(res, null);
    res.clearCookie('IAAAgreed');
    res.clearCookie('registrationToken');
  } else {
    setDevModeCookie(res, 'Token');
  }

  res.sendStatus(200);
});

api.delete(API.RemoveMember, authMiddleware, async (req, res) => {
  let deleted = await Groups.RemoveMember(req.params.group, req.params.identifier);
  return res.sendStatus(deleted ? 200 : 500);
});

api.get(API.GetSubgroups, baseMiddleware, async (req, res) => {
  let subgroups = await Groups.SearchGroups(process.env.BASE_GROUP, true);
  return res.status(200).json(subgroups);
});

api.delete(API.RemoveSubgroup, authMiddleware, async (req, res) => {
  const deleted = await Groups.DeleteGroup(req.params.group);
  return res.sendStatus(deleted ? 200 : 500);
});

api.post(API.CreateGroup, baseMiddleware, async (req, res) => {
  let created = await Groups.CreateGroup(req.params.group, req.body.confidential, req.body.description, req.body.email);
  return res.sendStatus(created ? 200 : 500);
});

api.get(API.CheckAuth, async (req, res) => {
  let redirectBack = IDAACHECK + idaaRedirectUrl(req);
  let auth = { Authenticated: req.isAuthenticated(), IAAAAuth: false, IAARedirect: redirectBack };

  if (!req.signedCookies) {
    return res.sendStatus(500);
  }

  if (req.isAuthenticated()) {
    const IAAAgreed = req.signedCookies.IAAAgreed || false;

    if (!IAAAgreed) {
      let found = false;
      let members = await Groups.GetMembers(IDAAGROUPID);
      if (members.find(u => u.id === req.user.UWNetID)) {
        found = true;
      }

      if (!found) {
        members = await Groups.GetMembers(IDAAGROUPID, true);
        if (members.find(u => u.id === req.user.UWNetID)) {
          found = true;
        }
      } else {
        // Re-check IAAAAuth in 1h
        res.cookie('IAAAgreed', true, { ...uwerSetCookieDefaults, maxAge: 60 * 60 * 1000 });
        auth.IAAAAuth = true;
      }
    } else {
      auth.IAAAAuth = true;
    }
  }

  return res.status(200).json(auth);
});

api.get(API.CSV, authMiddleware, async (req, res) => {
  let members = await Groups.GetMembers(getFullGroupName(req.params.group));
  let csvWhitelist = ['DisplayName', 'UWNetID', 'UWRegID'];
  let verboseMembers = await PWS.GetMany(members, csvWhitelist);
  let mergedMembers = await Groups.GetMemberHistory(verboseMembers, req.params.group);
  res.csv(mergedMembers, true);
});

export default api;
