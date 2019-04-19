import rp from 'request-promise';
import fs from 'fs';
import { FilterModel } from '../utils/helpers';

const GROUPSBASEURL = process.env.GROUPSBASEURL;
const CERTIFICATEFILE = process.env.CERTIFICATEFILE;
const PASSPHRASEFILE = process.env.PASSPHRASEFILE;
const INCOMMONFILE = process.env.INCOMMONFILE;
const GROUPDISPLAYNAME = process.env.GROUPDISPLAYNAME;
const BASE_GROUP = process.env.BASE_GROUP;
const CONTROLLING_CERTIFICATE = process.env.CONTROLLING_CERTIFICATE || 'integrations.event.uw.edu';

const options = {
  method: 'GET',
  url: '',
  json: true,
  ca: [fs.readFileSync(INCOMMONFILE, { encoding: 'utf8' })],
  agentOptions: {
    pfx: fs.readFileSync(CERTIFICATEFILE),
    passphrase: fs.readFileSync(PASSPHRASEFILE, { encoding: 'utf8' }).toString(),
    securityOptions: 'SSL_OP_NO_SSLv3'
  }
};

const SuccessResponse = (Payload, Status = 200) => {
  return {
    Status,
    Payload
  };
};
const ErrorResponse = ex => {
  return {
    Status: ex.statusCode,
    Payload: ex.error.errors
  };
};

// Takes a parent group and updates all subgroups non-destructively
const FixSubgroups = async parent => {
  let subgroups = (await Groups.SearchGroups(parent)).Payload;
  for (let s of subgroups) {
    if (s.id != parent) {
      let data = await Groups.GetGroupInfo(s.id);
      // Things to update go here
      // Extend admins section to include integrations cert and parent group members
      data.admins = [...data.admins, { type: 'dns', id: 'integrations.event.uw.edu' }, { type: 'group', id: parent }];
      // Format into GWS body format
      let body = { data };
      console.log('UPDATING', s.id, await Groups.UpdateGroup(s.id, body));
    }
  }
};

const Groups = {
  async IsConfidentialGroup(group) {
    return (await this.GetGroupInfo(group)).classification === 'c';
  },
  async GetGroupInfo(group) {
    let opts = Object.assign({}, options, {
      method: 'GET',
      url: `${GROUPSBASEURL}/group/${group}`
    });
    try {
      let res = await rp(opts);
      return res.data;
    } catch (ex) {
      throw ex;
    }
  },
  // Updates a group with the provided body (see: fixSubgroups for usage)
  async UpdateGroup(group, body) {
    let opts = Object.assign({}, options, {
      method: 'PUT',
      headers: {
        'If-Match': '*'
      },
      url: `${GROUPSBASEURL}/group/${group}`,
      body
    });
    try {
      let res = await rp(opts);
      return true;
    } catch (ex) {
      console.log('ERROR MESSAGE', ex);
      return false;
    }
  },
  async AddMember(group, identifier) {
    let opts = Object.assign({}, options, {
      method: 'PUT',
      url: `${GROUPSBASEURL}/group/${group}/member/${identifier}`
    });
    try {
      let res = await rp(opts);
      if (res.errors[0].notFound.length > 0) {
        return ErrorResponse({ statusCode: 404, error: { errors: 'User Not Found' } });
      }
      return SuccessResponse(res.errors[0], res.errors[0].status);
    } catch (ex) {
      return ErrorResponse(ex);
    }
  },
  async GetMembers(group, force = false) {
    let opts = Object.assign({}, options, {
      url: `${GROUPSBASEURL}/group/${group}/member${force ? '?source=registry' : ''}`
    });
    try {
      let res = await rp(opts);

      return SuccessResponse(res.data, res.error);
    } catch (ex) {
      return ErrorResponse(ex);
    }
  },
  // effective members gets all members of all groups
  // must have member read permission on all subgroups (or no viewer restrictions)
  async GetEffectiveMembers(group, force = false) {
    let opts = Object.assign({}, options, {
      url: `${GROUPSBASEURL}/group/${group}/effective_member${force ? '?source=registry' : ''}`
    });
    try {
      let res = await rp(opts);

      return SuccessResponse(res.data.map(u => u.id), res.error);
    } catch (ex) {
      return ErrorResponse(ex);
    }
  },
  async RemoveMember(group, netid) {
    let opts = Object.assign({}, options, {
      method: 'DELETE',
      url: `${GROUPSBASEURL}/group/${group}/member/${netid}?synchronized=true`
    });
    try {
      let res = await rp(opts);
      return SuccessResponse(res.errors[0], res.errors[0].status);
    } catch (ex) {
      return ErrorResponse(ex);
    }
  },
  async CreateGroup(group, confidential, description, email) {
    let classification = confidential == 'false' ? 'u' : 'c';
    let readers = confidential == 'false' ? [] : [{ type: 'set', id: 'none' }];

    let admins = [
      { id: CONTROLLING_CERTIFICATE, type: 'dns' },
      { id: 'uw_event', type: 'group' },
      { id: BASE_GROUP.substring(0, BASE_GROUP.length - 1), type: 'group' }
    ];

    let opts = Object.assign({}, options, {
      method: 'PUT',
      url: `${GROUPSBASEURL}/group/${group}?synchronized=true`,
      body: {
        data: {
          id: group,
          displayName: GROUPDISPLAYNAME,
          description,
          admins,
          readers,
          classification
        }
      }
    });

    try {
      let res = await rp(opts);
      if (email === 'true') {
        rp(
          Object.assign({}, options, {
            method: 'PUT',
            url: `${GROUPSBASEURL}/group/${group}/affiliate/google?status=active&sender=member`
          })
        );
      }
      return SuccessResponse(res.data);
    } catch (ex) {
      console.log(ex);
      return ErrorResponse(ex);
    }
  },

  async SearchGroups(group, verbose = false) {
    let opts = Object.assign({}, options, {
      method: 'GET',
      url: `${GROUPSBASEURL}/search?name=${group}*&owner=${CONTROLLING_CERTIFICATE}&type=direct&scope=all`
    });

    try {
      let data = (await rp(opts)).data;
      if (verbose) {
        let promises = [];
        let verboseGroups = [];
        await Promise.all(
          data.map(async g => {
            let vg = await this.GetGroupInfo(g.regid);
            if (vg.affiliates.length > 1) {
              vg.email = `${vg.id}@uw.edu`;
            }
            verboseGroups.push(vg);
          })
        );
        let filter = ['regid', 'displayName', 'id', 'url', 'description', 'classification', 'email'];
        verboseGroups = verboseGroups.map(vg => {
          return FilterModel(vg, filter);
        });
        data = verboseGroups;
      }
      return SuccessResponse(
        data.sort(function(a, b) {
          return a.id < b.id;
        })
      );
    } catch (ex) {
      return ErrorResponse(ex);
    }
  },
  async DeleteGroup(group) {
    let opts = Object.assign({}, options, {
      method: 'DELETE',
      url: `${GROUPSBASEURL}/group/${group}?synchronized=true`
    });
    try {
      let res = await rp(opts);
      return SuccessResponse(res.errors[0], res.errors[0].status);
    } catch (ex) {
      return ErrorResponse(ex);
    }
  },
  async GetHistory(group) {
    let history = [];
    let start = 0;
    let fetchHistory = true;
    let res;

    while (fetchHistory) {
      let opts = Object.assign({}, options, {
        url: `${GROUPSBASEURL}/group/${group}/history?activity=membership&order=a&start=${start}`
      });
      try {
        res = await rp(opts);

        // Breakout if no data available
        if (!res || !res.data || res.data.length == 0) {
          fetchHistory = false;
          break;
        }

        history = history.concat(res.data);
        start = res.data.reduce((prev, current) => {
          return (prev > current.timestamp) ? prev : current.timestamp + 1;
        }, start);

      } catch (ex) {
        return ErrorResponse(ex);
      }
    }

    return SuccessResponse(history, res.error);
  },
  async GetMemberHistory(memberList, group) {
    const membershipHistory = await this.GetHistory(group, memberList.length);
    const usefulMembershipHistory = membershipHistory
      .Payload
      .filter((e, i) => e && e.description && e.description.indexOf('add member') !== -1)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e, i) => ({
        UWNetID: e.description.match(/^add member: '(.*)'$/)[1],
        Registered: new Date(e.timestamp).toLocaleString(),
      }));

    const merged = memberList.map(src => ({
      ...usefulMembershipHistory.find((dst) => (dst.UWNetID === src.UWNetID) && dst),
      ...src,
    }));

    return merged;
  },
};

export default Groups;
