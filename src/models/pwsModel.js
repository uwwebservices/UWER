import config from '../config.json';
import rp from 'request-promise';
import fs from 'fs';

export default {
    get: (Id) => {
        let options = {
            method: 'GET',
            url: config.pwsBaseUrl + Id + '/full.json',
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            },
            json: true
        };
        return rp(options)
          .then((parsedBody) => {
            return parsedBody;
          })
          .catch((err) => {
            throw "Error Calling PWS";
          });
    }
}