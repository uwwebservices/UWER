import configurator from '../config/configurator';
import { Router } from 'express';
let config = configurator.get();

let api = Router();

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

api.put('/', (req, res) => {
    Object.keys(req.body).map((k) => {
        configurator.set(k, req.body[k]);
    });
    res.sendStatus(200);
})

export default api;