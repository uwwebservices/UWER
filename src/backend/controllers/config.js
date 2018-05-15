import configurator from 'utils/configurator';
import { Router } from 'express';
let config = configurator.get();

let api = Router();

// Items to return from config file
let whitelist = ["idcardBaseUrl", "pwsBaseUrl", "photoBaseUrl", "groupsBaseUrl", "groupNameLeaf", "groupNameBase"];

api.get('/', (req, res) => {
    config = configurator.get();
    let filteredConfig = Object.keys(config)
        .filter(key => whitelist.includes(key))
        .reduce((obj, key) => {
            obj[key] = config[key];
            return obj;
        }, {});
    res.json(filteredConfig);
});

export default api;