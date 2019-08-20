//@ts-check
import { Certificate, GroupsWebService } from 'ews-api-lib';
import { getFullGroupName } from '../utils/helpers';

const CONTROLLING_CERTIFICATE = process.env.CONTROLLING_CERTIFICATE || 'integrations.event.uw.edu';
const BASE_GROUP = process.env.BASE_GROUP;
const GROUPDISPLAYNAME = process.env.GROUPDISPLAYNAME;

const baseUrl = process.env.GROUPSBASEURL;
const s3Bucket = process.env.S3BUCKET;
const s3CertFile = process.env.S3CERTFILE;
const s3CertKeyFile = process.env.S3CERTKEYFILE;
const s3UWCAFile = process.env.S3UWCAFILE;
const s3IncommonFile = process.env.S3INCOMMONFILE;

const Groups = {
  async Setup() {
    let certificate = await Certificate.GetPFXFromS3(s3Bucket, s3CertFile, s3CertKeyFile, s3UWCAFile, s3IncommonFile);
    GroupsWebService.Setup(certificate, baseUrl);
  },
  async IsConfidentialGroup(group) {
    return (await this.GetGroupInfo(group)).classification === 'c';
  },
  async GetGroupInfo(group) {
    return (await GroupsWebService.Info([group]))[0];
  },
  async AddMember(group, identifier) {
    let fullGroupName = getFullGroupName(group);
    return await GroupsWebService.AddMember(fullGroupName, identifier);
  },
  async GetMembers(group, force = false) {
    return await GroupsWebService.GetMembers(group, false, force);
  },
  // Must have member read permission on all subgroups (or no viewer restrictions)
  async GetEffectiveMembers(group, force = false) {
    return await GroupsWebService.GetMembers(group, true, force);
  },

  async RemoveMember(group, netid) {
    let fullGroupName = getFullGroupName(group);
    return GroupsWebService.RemoveMember(fullGroupName, netid, true);
  },

  async CreateGroup(group, confidential, description, email) {
    let classification = confidential == 'false' ? 'u' : 'c';
    let readers = confidential == 'false' ? [] : [{ type: 'set', id: 'none' }];
    let fullGroupName = getFullGroupName(group);

    let admins = [{ id: CONTROLLING_CERTIFICATE, type: 'dns' }, { id: 'uw_event', type: 'group' }, { id: BASE_GROUP.substring(0, BASE_GROUP.length - 1), type: 'group' }];

    return await GroupsWebService.Create(fullGroupName, admins, readers, classification, GROUPDISPLAYNAME, description, true, email);
  },

  /**
   * Return an array of subgroups from GWS
   * Structure definition: {
   *   private: [gws classification field],
   *   description: [gws description field],
   *   email: [gws id field + @uw.edu]
   *   display: [group id sans BASE_GROUP; convert hypens to spaces],
   *   url: [gws url],
   *   name: [group id sans BASE_GROUP]
   * }
   *
   * @param {string} group
   * @param {boolean} verbose
   */
  async SearchGroups(group = process.env.BASE_GROUP, verbose = false) {
    const groupList = await GroupsWebService.Search(group, 'all', `&type=direct&owner=${CONTROLLING_CERTIFICATE}`);

    if (verbose) {
      let verboseGroups = [];
      await Promise.all(
        groupList.map(async g => {
          let vg = await this.GetGroupInfo(g);
          verboseGroups.push(vg);
        })
      );
      verboseGroups = verboseGroups.map(vg => {
        return {
          private: vg.classification === 'c',
          description: vg.description,
          email: vg.affiliates.length > 1 ? `${vg.id}@uw.edu` : '',
          display: vg.id.replace(BASE_GROUP, '').replace(/-/g, ' '),
          url: `https://groups.uw.edu/group/${vg.id}`,
          name: vg.id.replace(BASE_GROUP, '')
        };
      });
      return verboseGroups;
    } else {
      return groupList;
    }
  },
  async DeleteGroup(group) {
    let result = await GroupsWebService.Delete([group], true);
    return result.length === 1;
  },
  async GetMemberHistory(memberList, group) {
    const membershipHistory = await GroupsWebService.GetHistory(getFullGroupName(group));
    const usefulMembershipHistory = membershipHistory
      .filter((e, i) => e && e.description && e.description.indexOf('add member') !== -1)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e, i) => ({
        UWNetID: e.description.match(/^add member: '(.*)'$/)[1],
        Registered: new Date(e.timestamp).toLocaleString()
      }));

    const merged = memberList.map(src => ({
      ...usefulMembershipHistory.find(dst => dst.UWNetID === src.UWNetID && dst),
      ...src
    }));

    return merged;
  }
};

Groups.Setup();

export default Groups;
