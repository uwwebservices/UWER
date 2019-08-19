//@ts-check
import { Certificate, PersonWebService } from 'ews-api-lib';

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
  async Setup() {
    const baseUrl = process.env.PWSBASEURL;
    let s3Bucket = process.env.S3BUCKET;
    let s3CertFile = process.env.S3CERTFILE;
    let s3CertKeyFile = process.env.S3CERTKEYFILE;
    let s3UWCAFile = process.env.S3UWCAFILE;
    let s3IncommonFile = process.env.S3INCOMMONFILE;

    let certificate = await Certificate.GetPFXFromS3(s3Bucket, s3CertFile, s3CertKeyFile, s3UWCAFile, s3IncommonFile);
    PersonWebService.Setup(certificate, baseUrl);
  },

  async Get(identifier, whitelist) {
    let person = await PersonWebService.Get(identifier);
    return person === null ? defaultMember : FilterPWSModel(person, whitelist);
  },

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

PWS.Setup();

export default PWS;
