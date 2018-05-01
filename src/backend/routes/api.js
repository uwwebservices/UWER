import { Router } from 'express';
import configurator from '../config/configurator';
import idcard from '../controllers/idcard';
import pws from '../controllers/pws';
import groups from '../controllers/groups';
import register from '../controllers/register';
import configApi from '../controllers/config';

var unused;

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

export default api;
