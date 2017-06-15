import { version } from '../../package.json';
import { Router } from 'express';
import idcard from './idcard';
import pws from './pws';
import groups from './groups';
import register from './register';

export default ({ config }) => {
	let api = Router();

	// Registration API
    api.use('/register', register);

	// Groups API
	api.use('/groups', groups);

    // Optional API Routes
	// api.use('/idcard', idcard);
	// api.use('/pws', pws);
	
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
