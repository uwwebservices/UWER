import { Router } from 'express';
import Groups from 'models/groupModel';
import IDCard from 'models/idcardModel';
import PWS from 'models/pwsModel';
import Register from 'models/registerModel';

// to be removed
import idcard from 'controllers/idcard';
import pws from 'controllers/pws';
import groups from 'controllers/groups';
import register from 'controllers/register';
import configApi from 'controllers/config';

let api = Router();

// getMembers -- GET /members/:group
api.get('/members/:group', async (req, res) => {
  	try {
			// let members = await Groups.GetDetailedMembers(req.params.group);
			res.sendStatus(200).json(members);
		} catch (ex) {
			res.sendStatus(500).json({"error": ex });
		}
});

// addMember -- POST /members/:group/:identifier
api.post('/members/:group/:identifier', async (req, res) => {
try {
	// Groups.AddMember(req.params.group);
	res.sendStatus(200);
} catch (ex) {
	res.sendStatus(500).json({"error": ex });
}
});

// deleteMember -- DELETE /members/:group/:identifier
api.delete('/members/:group/:identifier', async (req, res) => {
	try {
		// await Groups.RemoveMember(req.params.group, req.params.identifier);
		res.sendStatus(200);
	} catch (ex) {
		res.sendStatus(500).json({"error": ex });
	}
});

// getConfig -- GET /config
api.get('/config', async (req, res) => {
	try {
		// let config = await Config.getConfig();
		let config = {"config": "config"};
		res.json(config);
	} catch (ex) {
		res.sendStatus(500).json({"error": ex });
	}
});

// getSubgroups -- GET /subgroups/:group
api.get('/subgroups/:group', async (req, res) => {
	try {
		// let subgroups = await Groups.GetSubgroups(req.params.group);
		let subgroups = {"subgroups": []};
		res.sendStatus(200).json(subgroups);
	} catch (ex) {
		res.sendStatus(500).json({"error": ex });
	}
});

// deleteSubgroup -- DELETE /subgroups/:subgroup
api.delete('/subgroups/:subgroup', async (req, res) => {
	try {
		// await Groups.DeleteSubgroup(req.params.subgroup);
		let subgroups = {"subgroups": []};
		res.sendStatus(200);
	} catch (ex) {
		res.sendStatus(500).json({"error": ex });
	}
});



// ------------------------------------------------------------
// OLD STUFF

// Registration API
	api.use('/register', register);

// Groups API
	api.use('/groups', groups);

// IDCardWS API
	api.use('/idcard', idcard);

// PWS API
	api.use('/pws', pws);

// Config API
	api.use('/config', configApi);

export default api;
