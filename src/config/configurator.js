import fs from 'fs';
import configFile from './config.json';

let config = configFile;

export default {
    get: () => {
        return config;
    },
    set: (key, value) => {
        let newConfig = Object.assign({}, config, {[key]: value});
        fs.writeFile(__dirname + '/config.json', JSON.stringify(newConfig, null, 2), function (err) {
            if (err) return console.log("Error updating config file:", err);
            console.log("Updated config.json:", key, ":", value);
        });
        config = newConfig;
    }
}