import rp from 'request-promise';
import fs from 'fs';
import config from 'config/config.json';

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

const defaultWhiteList = ["DisplayName", "UWNetID", "UWRegID"];
const FilterPWSModel = (model, whitelist = defaultWhiteList) => {
    return Object.keys(model)
        .filter(key => whitelist.includes(key))
        .reduce((obj, key) => {
            obj[key] = model[key];
            return obj;
        }, {});
}

const PWS = {
    async Get(identifier, whitelist) {
        let opts = Object.assign({}, options, { 
            url: `${config.pwsBaseUrl}/${identifier}/full.json`,
        });
        let res = await rp(opts);
        return FilterPWSModel(res,whitelist);
    },
    async GetMany(memberList, whitelist) {
        let members = [];
        for(let mem of memberList) {
            members.push(this.Get(mem.id, whitelist));
        }
        return await Promise.all(members);
    }
}

export default PWS;