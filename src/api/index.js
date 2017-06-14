import { version } from '../../package.json';
import { Router } from 'express';
import idcard from './idcard';
import pws from './pws';
import groups from './groups';

export default ({ config }) => {
	let api = Router();
    
	// idcard resource
	api.use('/idcard', idcard({config}));

	// pws resource
	api.use('/pws', pws({config}));

	// groups resource
	api.use('/groups', groups({config}));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
