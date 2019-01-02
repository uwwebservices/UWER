import rp from 'request-promise';
import fs from 'fs';

const CERTIFICATEFILE = process.env.CERTIFICATEFILE;
const PASSPHRASEFILE = process.env.PASSPHRASEFILE;
const PWSBASEURL = process.env.PWSBASEURL;

const options = {
    method: 'GET',
    url: "",
    agentOptions: {
        pfx: fs.readFileSync(CERTIFICATEFILE),
        passphrase: fs.readFileSync(PASSPHRASEFILE, { encoding: 'utf8'}).toString(), // WHY IS THERE A \n after?! fix this.
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
        let res;
        let opts = Object.assign({}, options, { 
            url: `${PWSBASEURL}/${identifier}/full.json`,
        });
        try {
            res = await rp(opts);
        } catch (ex) {
            res = { "UWNetID": "User Registered", "DisplayName": "Details Not Found", "UWRegID": ""};
        }
        return FilterPWSModel(res, whitelist);
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