import rp from 'request-promise';
import fs from 'fs';
import configurator from 'utils/configurator';
let config = configurator.get();

const options = {
    method: 'GET',
    url: "",
    agentOptions: {
        pfx: fs.readFileSync(config.certificate),
        passphrase: config.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
    },
    json: true
};

export default {
    // Id can be regid or netid
    get: (Id) => {
        config = configurator.get();
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