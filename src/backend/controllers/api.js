import { Router } from 'express';
import Groups from 'models/groupModel';
import IDCard from 'models/idcardModel';
import PWS from 'models/pwsModel';
import csv from 'csv-express';
import config from 'config/config.json';

let api = Router();

api.get('/members/:group', async (req, res) => {
		let result = await Groups.GetMembers(req.params.group);
		let members = await PWS.GetMany(result.Payload);
		let verbose = await IDCard.GetManyPhotos(members);
		return res.status(result.Status).json(verbose);
});

api.put('/members/:group/:identifier', async (req, res) => {
	let identifier = req.params.identifier;
	let validCard = IDCard.ValidCard(identifier);

	if(validCard){
		identifier = await IDCard.Get(validCard);
		identifier = (await PWS.Get(identifier)).UWNetID;
	}
	
	let result = await Groups.AddMember(req.params.group, identifier);
	let user = await PWS.Get(identifier);
	user.Base64Image = await IDCard.GetPhoto(user.UWRegID);
	return res.status(result.Status).json(user);
});

api.delete('/members/:group/member/:identifier', async (req, res) => {
	let result = await Groups.RemoveMember(req.params.group, req.params.identifier);
	return res.status(result.Status).json(result.Payload);
});

api.get('/subgroups/:group', async (req, res) => {
	let result = await Groups.SearchGroups(req.params.group);
	return res.status(result.Status).json(result.Payload);
});

api.delete('/subgroups/:group', async (req, res) => {
	let result = await Groups.DeleteGroup(req.params.group);
	return res.status(result.Status).json(result.Payload);
});

api.post('/subgroups/:group', async (req, res) => {
	let result = await Groups.CreateGroup(req.params.group);
	return res.status(result.Status).json(result.Payload);
});


api.get('/config', (req, res) => {
	let whitelist = ["idcardBaseUrl", "pwsBaseUrl", "photoBaseUrl", "groupsBaseUrl", "groupNameLeaf", "groupNameBase"];
	let filteredConfig = Object.keys(config)
			.filter(key => whitelist.includes(key))
			.reduce((obj, key) => {
					obj[key] = config[key];
					return obj;
			}, {});
	res.status(200).json(filteredConfig);
});

api.get('/csv/:group.csv', async (req, res) => {
	let members = await Groups.GetMembers(req.params.group);
	let csvWhitelist = ["DisplayName", "UWNetID", "UWRegID"];
	let verboseMembers = await PWS.GetMany(members.Payload, csvWhitelist);
	res.csv(verboseMembers, true);
});

export default api;
