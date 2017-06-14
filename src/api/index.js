import { version } from '../../package.json';
import { Router } from 'express';
import idcard from './idcard';
import pws from './pws';
import groups from './groups';
import register from './register';

export default ({ config }) => {
	let api = Router();

    api.use('/register', register);

    // Optional API Routes
	// api.use('/idcard', idcard);
	// api.use('/pws', pws);
	// api.use('/groups', groups);
	
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
