// This file will not cause nodemon to restart
import fs from 'fs';
import configFile from './config.json';

let config = configFile;

export default {
    get: () => {
        return config;
    },
    set: (key, value) => {
        if(config[key] !== value) {
            let newConfig = Object.assign({}, config, {[key]: value});
            fs.writeFile(__dirname + '/config.json', JSON.stringify(newConfig, null, 2), function (err) {
                if (err) throw err;
                config = newConfig;
            });
        }
    }
}