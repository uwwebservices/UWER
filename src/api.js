import { version } from '../package.json';
import { Router } from 'express';
import configurator from './config/configurator';
import idcard from './api/idcard';
import pws from './api/pws';
import groups from './api/groups';
import register from './api/register';
import configApi from './api/config';

let config = configurator.get();

let api = Router();

// Registration API
if(config.enableRegisterAPI) {
	api.use('/register', register);
}

// Groups API
if(config.enableGroupsAPI){
	api.use('/groups', groups);
}

// IDCardWS API
if(config.enableIDCardAPI) {
	api.use('/idcard', idcard);
}

// PWS API
if(config.enablePWSAPI) {
	api.use('/pws', pws);
}

// Config API
if(config.enableConfigAPI) {
	api.use('/config', configApi);
}

api.get('/', (req, res) => {
	res.json({ version });
});

export default api;
