import { Router } from 'express';
import Groups from 'models/groupModel';
import IDCard from 'models/idcardModel';
import PWS from 'models/pwsModel';
import { API } from 'Routes';
import { authMiddleware, authOrTokenMiddleware, baseMiddleware, getFullGroupName, idaaRedirectUrl, setDevModeCookie, uwerSetCookieDefaults } from '../utils/helpers';

let api = Router();

const IDAACHECK = process.env.IDAACHECK;
const IDAAGROUPID = process.env.IDAAGROUPID;

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

  let result = await Groups.GetMembers(getFullGroupName(groupName));
  let members = await PWS.GetMany(result.Payload);
  let verbose = await IDCard.GetManyPhotos(groupName, members);
  response.members = verbose;
  return res.status(result.Status).json(response);
});

api.put(API.RegisterMember, authOrTokenMiddleware, async (req, res) => {
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

  let result = await Groups.AddMember(getFullGroupName(groupName), identifier);
  if (result.Status === 200) {
    let user = await PWS.Get(identifier);

    user.displayId = displayId;
    user.Base64Image = await IDCard.GetOnePhoto(groupName, user.UWRegID);
    res.status(confidential ? 201 : result.Status).json(user);
  } else {
    res.sendStatus(result.Status);
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
  const confidential = await Groups.IsConfidentialGroup(getFullGroupName(groupName));
  const netidAllowed = req.query.netidAllowed;
  const tokenTTL = req.query.tokenTTL;
  const expiry = now.setMinutes(now.getMinutes() + +tokenTTL);
  const token = { user, groupName, confidential, netidAllowed, expiry };
  res.cookie('registrationToken', token, { ...uwerSetCookieDefaults, maxAge: (+tokenTTL + 30) * 60 * 1000 });

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
  let result = await Groups.RemoveMember(getFullGroupName(req.params.group), req.params.identifier);
  return res.status(result.Status).json(result.Payload);
});

api.get(API.GetSubgroups, baseMiddleware, async (req, res) => {
  let result = await Groups.SearchGroups(getFullGroupName(''), true);
  return res.status(result.Status).json(result.Payload);
});

api.delete(API.RemoveSubgroup, authMiddleware, async (req, res) => {
  let result = await Groups.DeleteGroup(getFullGroupName(req.params.group));
  return res.status(result.Status).json(result.Payload);
});

api.post(API.CreateGroup, baseMiddleware, async (req, res) => {
  let confidential = req.query.confidential;
  let description = req.query.description;
  let email = req.query.email;

  let result = await Groups.CreateGroup(getFullGroupName(req.params.group), confidential, description, email);
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

api.get(API.CSV, authMiddleware, async (req, res) => {
  const fullGroupName = getFullGroupName(req.params.group);
  let members = await Groups.GetMembers(fullGroupName);
  let csvWhitelist = ['DisplayName', 'UWNetID', 'UWRegID'];
  let verboseMembers = await PWS.GetMany(members.Payload, csvWhitelist);
  let mergedMembers = await Groups.GetMemberHistory(verboseMembers, fullGroupName);
  res.csv(mergedMembers, true);
});

export default api;
