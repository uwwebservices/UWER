import config from '../config/config.json';
import rp from 'request-promise';
import fs from 'fs';

const options = {
    method: 'GET',
    url: "",
    agentOptions: {
        pfx: fs.readFileSync(__dirname + "/../" + config.certificate),
        passphrase: config.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
    },
    json: true
};

export default {
    get: (Id) => {
        let opts = Object.assign({}, options, { 
            url: config.pwsBaseUrl + Id + '/full.json',
        });
        return rp(opts)
          .then((parsedBody) => {
            return parsedBody;
          })
          .catch((err) => {
            throw err;
          });
    }
}