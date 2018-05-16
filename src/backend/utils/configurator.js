// This file will not cause nodemon to restart
import fs from 'fs';
import configFile from 'config/config.json';

export default {
    get: () => {
        return configFile;
    }
}