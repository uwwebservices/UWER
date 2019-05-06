import { PersonWebService } from 'ews-api-lib';
import fs from 'fs';

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
  Setup() {
    const certificate = {
      pfx: fs.readFileSync(process.env.CERTIFICATEFILE),
      passphrase: fs.readFileSync(process.env.PASSPHRASEFILE, { encoding: 'utf8' }).toString(),
      ca: fs.readFileSync(process.env.INCOMMONFILE)
    };
    const baseUrl = process.env.PWSBASEURL;

    PersonWebService.Setup(certificate, baseUrl);
  },

  async Get(identifier, whitelist) {
    let person = await PersonWebService.Get(identifier);
    return person === null ? defaultMember : FilterPWSModel(person, whitelist);
  },

  async GetMany(memberList, whitelist) {
    const persons = await PersonWebService.GetMany(memberList.map(x => x.id));
    const filtered = persons.map((person, i) => {
      return person === null ? defaultMember : FilterPWSModel(person, whitelist);
    });

    return filtered;
  }
};

PWS.Setup();

export default PWS;
