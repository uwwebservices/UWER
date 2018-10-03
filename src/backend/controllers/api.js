import { Router } from 'express';
import Groups from 'models/groupModel';
import IDCard from 'models/idcardModel';
import PWS from 'models/pwsModel';
import config from 'config/config.json';
import { ensureAPIAuth, ensureAuthOrToken, getAuthToken, idaaRedirectUrl, decryptAuthToken } from '../utils/helpers';
import { API, Routes } from 'Routes';
import csv from 'csv-express';

let api = Router();

api.get(API.GetMembers, async (req, res) => {
		let result = await Groups.GetMembers(req.params.group);
		let members = await PWS.GetMany(result.Payload);
		let verbose = await IDCard.GetManyPhotos(members);
		return res.status(result.Status).json(verbose);
});

api.get(API.GetToken, ensureAPIAuth, (req, res) => {
	let groupName = req.query.groupName;
	let netidAllowed = req.query.netidAllowed;
	let token = getAuthToken(req, groupName, netidAllowed);
	if(token) {
		return res.status(200).json({token});
	} else {
		return res.status(401).json({token: ""});
	}
});

api.get(API.Logout, (req,res) => {	
	req.logout();
	req.session.destroy();
	res.clearCookie('connect.sid', {path: Routes.Welcome});
	res.sendStatus(200);
});

api.put(API.RegisterMember, ensureAuthOrToken, async (req, res) => {
	let identifier = req.body.identifier;
	let displayId = req.body.displayId;
	let validCard = IDCard.ValidCard(identifier);
	let groupName = req.params.group;
	let netidAllowed = req.isAuthenticated();

	// if not auth'd, we force the groupname/netidauth from token
	//if(!req.isAuthenticated() && req.body.token) {
	if(req.body.token) {
		let tokenData = decryptAuthToken(req.body.token);
		groupName = tokenData.groupName;
		netidAllowed = tokenData.netidAllowed;
	}
	
	if(!validCard && netidAllowed == 'false') {
		// if not a valid card and netid auth not allowed, 404
		return res.sendStatus(404);
	}

	if(validCard){
		identifier = await IDCard.Get(validCard);
		identifier = (await PWS.Get(identifier)).UWNetID;
	}

	let result = await Groups.AddMember(groupName, identifier);
	if(result.Status === 200) {
		let user = await PWS.Get(identifier);
		user.displayId = displayId;
		user.Base64Image = await IDCard.GetPhoto(user.UWRegID);
		res.status(result.Status).json(user);
	} else {
		res.sendStatus(result.Status);
	}
	
});

api.delete(API.RemoveMember, ensureAPIAuth, async (req, res) => {
	let result = await Groups.RemoveMember(req.params.group, req.params.identifier);
	return res.status(result.Status).json(result.Payload);
});

api.get(API.GetSubgroups, ensureAPIAuth, async (req, res) => {
	let result = await Groups.SearchGroups(req.params.group);
	return res.status(result.Status).json(result.Payload);
});

api.delete(API.RemoveSubgroup, ensureAPIAuth, async (req, res) => {
	let result = await Groups.DeleteGroup(req.params.group);
	return res.status(result.Status).json(result.Payload);
});

api.post(API.CreateGroup, ensureAPIAuth, async (req, res) => {
	let result = await Groups.CreateGroup(req.params.group);
	return res.status(result.Status).json(result.Payload);
});

api.get(API.CheckAuth, async (req, res) => {
	let redirectBack = config.idaaCheck + idaaRedirectUrl(req);
	let auth = { Authenticated: req.isAuthenticated(), IAAAAuth: false, IAARedirect: redirectBack };

	if(!req.session)
	{
		return res.status(500).send("Chris Cloud(tm)");
	}
	
	if(req.isAuthenticated()) {
		if(!req.session.IAAAgreed) {
			let found = false;
			let members = (await Groups.GetMembers(config.idaaGroupID)).Payload;
			if(members.find(u => u.id === req.user.UWNetID)) {
				found = true;
			}	

			if(!found)
			{
				members = (await Groups.GetMembers(config.idaaGroupID, true)).Payload;
				if(members.find(u => u.id === req.user.UWNetID)) {
					found = true;
				}	
			}

			if(found)
			{
				req.session.IAAAgreed=true;
				auth.IAAAAuth=true;
			}
		} else {
			auth.IAAAAuth=true;
		}	
	} 

	return res.status(200).json(auth);
});

api.get(API.Config, (req, res) => {
	let whitelist = ["groupNameBase"];
	let filteredConfig = Object.keys(config)
			.filter(key => whitelist.includes(key))
			.reduce((obj, key) => {
					obj[key] = config[key];
					return obj;
			}, {});
			if(process.env.BASE_GROUP) {
				filteredConfig.groupNameBase = process.env.BASE_GROUP;
			}
	res.status(200).json(filteredConfig);
});

api.get(API.CSV, async (req, res) => {
	let members = await Groups.GetMembers(req.params.group);
	let csvWhitelist = ["DisplayName", "UWNetID", "UWRegID"];
	let verboseMembers = await PWS.GetMany(members.Payload, csvWhitelist);
	res.csv(verboseMembers, true);
});

export default api;
