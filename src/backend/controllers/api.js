import { Router } from 'express';
import Groups from 'models/groupModel';
import IDCard from 'models/idcardModel';
import PWS from 'models/pwsModel';
import { ensureAPIAuth, ensureAuthOrToken, idaaRedirectUrl, requestSettingsOverrides, setDevModeCookie, uwerSetCookieDefaults, ensureValidGroupName } from '../utils/helpers';
import { API, Routes } from 'Routes';
import csv from 'csv-express'; // required for csv route even though shown as unused

let api = Router();

const IDAACHECK = process.env.IDAACHECK;
const IDAAGROUPID = process.env.IDAAGROUPID;
const BASE_GROUP = process.env.BASE_GROUP;

api.get(API.GetMembers, ensureAuthOrToken, requestSettingsOverrides, ensureValidGroupName, async (req, res) => {
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

  let result = await Groups.GetMembers(groupName);
  let members = await PWS.GetMany(result.Payload);
  let verbose = await IDCard.GetManyPhotos(groupName, members);
  response.members = verbose;
  return res.status(result.Status).json(response);
});

api.put(API.RegisterMember, ensureAuthOrToken, requestSettingsOverrides, ensureValidGroupName, async (req, res) => {
  const settings = req.signedCookies.registrationToken;
  let identifier = req.body.identifier;
  let displayId = req.body.displayId;
  let validCard = IDCard.ValidCard(identifier);
  let groupName = settings.groupName;
  let netidAllowed = settings.netidAllowed;
  let confidential = settings.confidential;

  if (!validCard && netidAllowed == 'false') {
    // if not a valid card and netid auth not allowed, 404
    return res.sendStatus(404);
  }

  if (validCard) {
    identifier = await IDCard.Get(validCard);
    identifier = (await PWS.Get(identifier)).UWNetID;
  }

  let result = await Groups.AddMember(groupName, identifier);
  if (result.Status === 200) {
    let user = await PWS.Get(identifier);

    user.displayId = displayId;
    user.Base64Image = await IDCard.GetOnePhoto(groupName, user.UWRegID);
    res.status(confidential ? 201 : result.Status).json(user);
  } else {
    res.sendStatus(result.Status);
  }
});

api.get(API.GetMemberPhoto, ensureAuthOrToken, requestSettingsOverrides, ensureValidGroupName, async (req, res) => {
  const settings = req.signedCookies.registrationToken;
  let groupName = settings.groupName;

  let image = await IDCard.GetPhoto(req.params.identifier);
  res.header('Content-Type', 'image/jpeg');
  return res.status(200).send(image);
});

api.get(API.GetToken, ensureAPIAuth, async (req, res) => {
  const now = new Date();
  const user = req.user;
  const groupName = req.query.groupName;
  const confidential = await Groups.IsConfidentialGroup(groupName);
  const netidAllowed = req.query.netidAllowed;
  const tokenTTL = req.query.tokenTTL;
  const expiry = now.setMinutes(now.getMinutes() + tokenTTL);

  const token = { user, groupName, confidential, netidAllowed, expiry };
  res.cookie('registrationToken', token, { ...uwerSetCookieDefaults, maxAge: (tokenTTL + 30) * 60 * 1000 });

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

api.delete(API.RemoveMember, ensureAPIAuth, ensureValidGroupName, async (req, res) => {
  let result = await Groups.RemoveMember(req.params.group, req.params.identifier);
  return res.status(result.Status).json(result.Payload);
});

api.get(API.GetSubgroups, ensureAPIAuth, async (req, res) => {
  let result = await Groups.SearchGroups(BASE_GROUP, true);
  return res.status(result.Status).json(result.Payload);
});

api.delete(API.RemoveSubgroup, ensureAPIAuth, ensureValidGroupName, async (req, res) => {
  let result = await Groups.DeleteGroup(req.params.group);
  return res.status(result.Status).json(result.Payload);
});

api.post(API.CreateGroup, ensureAPIAuth, ensureValidGroupName, async (req, res) => {
  let confidential = req.query.confidential;
  let description = req.query.description;
  let email = req.query.email;

  let result = await Groups.CreateGroup(req.params.group, confidential, description, email);
  return res.status(result.Status).json(result.Payload);
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
      let members = (await Groups.GetMembers(IDAAGROUPID)).Payload;
      if (members.find(u => u.id === req.user.UWNetID)) {
        found = true;
      }

      if (!found) {
        members = (await Groups.GetMembers(IDAAGROUPID, true)).Payload;
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

// @TODO: Remove method after frontend refactor to not rely on API.GetConfig
api.get('/config', (req, res) => {
  res.status(200).json({ groupNameBase: BASE_GROUP });
});

api.get(API.CSV, ensureAPIAuth, ensureValidGroupName, async (req, res) => {
  let members = await Groups.GetMembers(req.params.group);
  let csvWhitelist = ['DisplayName', 'UWNetID', 'UWRegID'];
  let verboseMembers = await PWS.GetMany(members.Payload, csvWhitelist);
  let mergedMembers = await Groups.GetMemberHistory(verboseMembers, req.params.group);
  res.csv(mergedMembers, true);
});

export default api;
