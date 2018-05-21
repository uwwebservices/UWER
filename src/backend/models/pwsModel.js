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

const whitelist = ["DisplayName", "UWNetID", "UWRegID"];
const FilterPWSModel = model => {
    return Object.keys(model)
        .filter(key => whitelist.includes(key))
        .reduce((obj, key) => {
            obj[key] = model[key];
            return obj;
        }, {});
}

const PWS = {
    Get: async identifier => {
        let opts = Object.assign({}, options, { 
            url: `${config.pwsBaseUrl}/${identifier}/full.json`,
        });
        let res = await rp(opts);
        return FilterPWSModel(res);
    },
    GetMany: async memberList => {
        let members = [];
        for(let mem of memberList) {
            members.push(PWS.Get(mem.id));
        }
        return await Promise.all(members);
    }
}

export default PWS;