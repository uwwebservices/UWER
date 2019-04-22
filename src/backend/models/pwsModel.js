import rp from 'request-promise';
import fs from 'fs';

const CERTIFICATEFILE = process.env.CERTIFICATEFILE;
const PASSPHRASEFILE = process.env.PASSPHRASEFILE;
const PWSBASEURL = process.env.PWSBASEURL;

const options = {
  method: 'GET',
  url: '',
  agentOptions: {
    pfx: fs.readFileSync(CERTIFICATEFILE),
    passphrase: fs.readFileSync(PASSPHRASEFILE, { encoding: 'utf8' }).toString(),
    securityOptions: 'SSL_OP_NO_SSLv3'
  },
  json: true
};

const defaultWhiteList = ['DisplayName', 'UWNetID', 'UWRegID', 'EduPersonAffiliations'];
const defaultMember = { UWNetID: 'User Registered', DisplayName: 'Details Not Found', UWRegID: '' };
const FilterPWSModel = (model, whitelist = defaultWhiteList) => {
  return Object.keys(model)
    .filter(key => whitelist.includes(key))
    .reduce((obj, key) => {
      obj[key] = model[key];
      return obj;
    }, {});
};

const PWS = {
  async Get(identifier, whitelist) {
    let res;
    let opts = Object.assign({}, options, {
      url: `${PWSBASEURL}/${identifier}/full.json`
    });
    try {
      res = await rp(opts);
    } catch (ex) {
      res = defaultMember;
    }
    return FilterPWSModel(res, whitelist);
  },
  async GetManyBatched(memberList, whitelist) {
    const batchSize = 15;
    let start = 0;
    let end = start + batchSize > memberList.length ? memberList.length : start + batchSize;
    const filtered = [];

    while (end <= memberList.length) {
      let res = { Persons: [] };
      const members = memberList.slice(start, end).map(x => x.id);
      const opts = Object.assign({}, options, {
        url: `${PWSBASEURL}.json?uwnetid=${members.join(',')}&verbose=true`
      });

      // Breakout if no members
      if (members.length == 0) {
        break;
      }

      try {
        res = await rp(opts);
      } catch (ex) {
        for (let _ of members) {
          res.Persons.push(defaultMember);
        }
      }

      for (let person of res.Persons) {
        filtered.push(FilterPWSModel(person, whitelist));
      }

      start = end;
      end = start + batchSize > memberList.length ? memberList.length : start + batchSize;
    }

    return filtered;
  },
  async GetMany(memberList, whitelist) {
    return await this.GetManyBatched(memberList, whitelist);
  }
};

export default PWS;
