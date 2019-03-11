import { Router } from 'express';
import Groups from 'models/groupModel';
import IDCard from 'models/idcardModel';
import PWS from 'models/pwsModel';
import { ensureAPIAuth, ensureAuthOrToken, getAuthToken, idaaRedirectUrl, developmentMode, tokenToSession } from '../utils/helpers';
import { API, Routes } from 'Routes';
import csv from 'csv-express'; // required for csv route even though shown as unused

let api = Router();

const IDAACHECK = process.env.IDAACHECK;
const IDAAGROUPID = process.env.IDAAGROUPID;
const BASE_GROUP = process.env.BASE_GROUP;

api.get(API.GetMembers, ensureAuthOrToken, tokenToSession, async (req, res) => {
  let groupName = req.session.group.groupName;
  let confidential = req.session.group.confidential;
  let response = {
    groupName,
    confidential,
    members: []
  };

  if (confidential && !req.isAuthenticated() && !developmentMode) {
    return res.status(200).json(response);
  }
  let result = await Groups.GetMembers(groupName);
  let members = await PWS.GetMany(result.Payload);
  let verbose = await IDCard.GetManyPhotos(members);
  response.members = verbose;
  return res.status(result.Status).json(response);
});

api.put(API.RegisterMember, ensureAuthOrToken, tokenToSession, async (req, res) => {
  let identifier = req.body.identifier;
  let displayId = req.body.displayId;
  let validCard = IDCard.ValidCard(identifier);
  let groupName = req.session.group.groupName;
  let netidAllowed = req.session.group.netidAllowed;
  let confidential = req.session.group.confidential;

  if (!validCard && netidAllowed == 'false') {
    // if not a valid card and netid auth not allowed, 404
    return res.sendStatus(404);
  }

  if (validCard) {
    identifier = await IDCard.Get(validCard);
    identifier = (await PWS.Get(identifier)).UWNetID;
  }

  let result = await Groups.AddMember(groupName, identifier);

  if (result.Status === 200 && confidential) {
    res.sendStatus(201);
  }

  if (result.Status === 200 && !confidential) {
    let user = await PWS.Get(identifier);

    user.displayId = displayId;
    user.Base64Image = await IDCard.GetPhoto(user.UWRegID);
    res.status(result.Status).json(user);
  } else {
    res.sendStatus(result.Status);
  }
});

api.get(API.GetToken, ensureAPIAuth, (req, res) => {
  let groupName = req.query.groupName;
  let netidAllowed = req.query.netidAllowed;
  let tokenTTL = req.query.tokenTTL;

  let token = getAuthToken(req, groupName, netidAllowed, tokenTTL);
  if (token) {
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ token: '' });
  }
});

api.get(API.Logout, (req, res) => {
  req.logout();
  req.session.destroy();
  res.clearCookie('connect.sid', { path: Routes.Welcome });
  res.sendStatus(200);
});

api.delete(API.RemoveMember, ensureAPIAuth, async (req, res) => {
  let result = await Groups.RemoveMember(req.params.group, req.params.identifier);
  return res.status(result.Status).json(result.Payload);
});

api.get(API.GetSubgroups, ensureAPIAuth, async (req, res) => {
  let result = await Groups.SearchGroups(req.params.group, true);
  return res.status(result.Status).json(result.Payload);
});

api.delete(API.RemoveSubgroup, ensureAPIAuth, async (req, res) => {
  let result = await Groups.DeleteGroup(req.params.group);
  return res.status(result.Status).json(result.Payload);
});

api.post(API.CreateGroup, ensureAPIAuth, async (req, res) => {
  let confidential = req.query.confidential;
  let description = req.query.description;
  let email = req.query.email;

  let result = await Groups.CreateGroup(req.params.group, confidential, description, email);
  return res.status(result.Status).json(result.Payload);
});

api.get(API.CheckAuth, async (req, res) => {
  let redirectBack = IDAACHECK + idaaRedirectUrl(req);
  let auth = { Authenticated: req.isAuthenticated(), IAAAAuth: false, IAARedirect: redirectBack };

  if (!req.session) {
    return res.sendStatus(500);
  }

  if (req.isAuthenticated()) {
    if (!req.session.IAAAgreed) {
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
        req.session.IAAAgreed = true;
        auth.IAAAAuth = true;
      }
    } else {
      auth.IAAAAuth = true;
    }
  }
  return res.status(200).json(auth);
});

api.get(API.Config, (req, res) => {
  res.status(200).json({ groupNameBase: BASE_GROUP });
});

api.get(API.CSV, async (req, res) => {
  let members = await Groups.GetMembers(req.params.group);
  let csvWhitelist = ['DisplayName', 'UWNetID', 'UWRegID'];
  let verboseMembers = await PWS.GetMany(members.Payload, csvWhitelist);
  res.csv(verboseMembers, true);
});

export default api;
