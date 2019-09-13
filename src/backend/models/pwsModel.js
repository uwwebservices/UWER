//@ts-check
import { PersonWebService } from 'ews-api-lib';

const baseUrl = process.env.PWSBASEURL;

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
  async Setup(certificate) {
    PersonWebService.Setup(certificate, baseUrl);
  },

  /**
   * Get info about a user
   * @param identifier UWNetID/UWRegID of the user
   * @param whitelist The fields to allow in the response
   * @returns UserInfo
   */
  async Get(identifier, whitelist) {
    let person = await PersonWebService.Get(identifier);
    return person === null ? defaultMember : FilterPWSModel(person, whitelist);
  },

  /**
   * Get info about many users
   * @param memberList list of UWNetID/UWRegID to look up
   * @param whitelist The fields to allow in the response
   * @returns UserInfo[]
   */
  async GetMany(memberList, whitelist) {
    let persons = [];
    try {
      persons = await PersonWebService.GetMany(memberList.map(x => x.id));
    } catch (ex) {
      console.log(ex);
    }
    const filtered = persons.map((person, i) => {
      return person === null ? defaultMember : FilterPWSModel(person, whitelist);
    });

    return filtered;
  }
};

export default PWS;
