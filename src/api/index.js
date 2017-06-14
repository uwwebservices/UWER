import { version } from '../../package.json';
import { Router } from 'express';
import idcard from './idcard';
import pws from './pws';
import groups from './groups';
import register from './register';

export default ({ config }) => {
	let api = Router();
    
	// idcard resource
	api.use('/idcard', idcard);

	// pws resource
	api.use('/pws', pws);

	// groups resource
	api.use('/groups', groups);

	// registration resource
	api.use('/register', register);

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
