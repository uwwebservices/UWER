//@ts-check
import { GroupsWebService } from 'ews-api-lib';
import { getFullGroupName } from '../utils/helpers';

const CONTROLLING_CERTIFICATE = process.env.CONTROLLING_CERTIFICATE || 'integrations.event.uw.edu';
const BASE_GROUP = process.env.BASE_GROUP;
const GROUPDISPLAYNAME = process.env.GROUPDISPLAYNAME;

const baseUrl = process.env.GROUPSBASEURL;

const Groups = {
  async Setup(certificate) {
    GroupsWebService.Setup(certificate, baseUrl);
  },

  /**
   * Checks if a group is marked as confidential
   * @param group The full group name to check confidentiality
   * @returns boolean
   */
  async IsConfidentialGroup(group) {
    return (await this.GetGroupInfo(group)).classification === 'c';
  },

  /**
   * Gets full group info
   * @param group The full group name to get info on
   * @returns UWGroup
   */
  async GetGroupInfo(group) {
    return (await GroupsWebService.Info([group]))[0];
  },

  /**
   * Add a member to a group
   * @param group the short group name
   * @returns boolean
   */
  async AddMember(group, identifier) {
    let fullGroupName = getFullGroupName(group);
    return await GroupsWebService.AddMember(fullGroupName, identifier);
  },

  /**
   * Get members of a group
   * @param group The full group name
   * @param force Force GWS to use the registry
   * @returns List of members
   */
  async GetMembers(group, force = false) {
    return await GroupsWebService.GetMembers(group, false, force);
  },

  /**
   * Get effective members of a group (members of group members)
   * Must have member read permission on all subgroups (or no viewer restrictions)
   * @param group The full group name
   * @returns List of members
   */
  async GetEffectiveMembers(group, force = false) {
    return await GroupsWebService.GetMembers(group, true, force);
  },

  /**
   * Remove a member from a group
   * @param group The short group name
   * @param netid The netid to remove
   * @returns boolean
   */
  async RemoveMember(group, netid) {
    let fullGroupName = getFullGroupName(group);
    return GroupsWebService.RemoveMember(fullGroupName, netid, true);
  },

  /**
   * Create a new group
   * @param {string} group The short group name to create
   * @param {boolean} confidential If group should be confidential
   * @param {string} description The description of the new group
   * @param {boolean} email Should email be enabled?
   * @returns boolean
   */
  async CreateGroup(group, confidential, description, email) {
    let classification = confidential === false ? 'u' : 'c';
    let readers = confidential === false ? [] : [{ type: 'set', id: 'none' }];
    let fullGroupName = getFullGroupName(group);

    let admins = [{ id: CONTROLLING_CERTIFICATE, type: 'dns' }, { id: 'uw_event', type: 'group' }, { id: BASE_GROUP.substring(0, BASE_GROUP.length - 1), type: 'group' }];

    return await GroupsWebService.Create(fullGroupName, admins, readers, classification, GROUPDISPLAYNAME, description, true, email);
  },

  /**
   * Return an array of subgroups from GWS
   * @param {string} group
   * @param {boolean} verbose
   * @returns
   * Structure definition: {
   *   private: [gws classification field],
   *   description: [gws description field],
   *   email: [gws id field + @uw.edu]
   *   display: [group id sans BASE_GROUP; convert hypens to spaces],
   *   url: [gws url],
   *   name: [group id sans BASE_GROUP]
   * }
   */
  async SearchGroups(group = process.env.BASE_GROUP, verbose = false) {
    const groupList = await GroupsWebService.Search(group, 'all', `&type=direct&owner=${CONTROLLING_CERTIFICATE}`);

    // GWS sometimes returns the base group in the results with this type of query, lets remove that
    const basegroupidx = groupList.indexOf(group.slice(0, -1));
    if (basegroupidx !== -1) {
      groupList.splice(basegroupidx, 1);
    }

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

  /**
   * Delete a group
   * @param group The short group name
   * @returns boolean
   */
  async DeleteGroup(group) {
    let fullGroupName = getFullGroupName(group);
    let result = await GroupsWebService.Delete([fullGroupName], true);
    return result.length === 1;
  },

  /**
   * Get Membership History of group members
   * @param memberList The members to get history for
   * @param group The short group name
   * @returns boolean
   */
  async GetMemberHistory(memberList, group) {
    const membershipHistory = await GroupsWebService.GetHistory(getFullGroupName(group));
    const usefulMembershipHistory = membershipHistory
      .filter((e, i) => e && e.description && e.description.indexOf('add member') !== -1)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e, i) => ({
        UWNetID: e.description.match(/^add member: '(.*)'$/)[1],
        Registered: new Date(e.timestamp).toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles'
        })
      }));

    const merged = memberList.map(src => ({
      ...usefulMembershipHistory.find(dst => dst.UWNetID === src.UWNetID && dst),
      ...src
    }));

    return merged;
  }
};

export default Groups;
