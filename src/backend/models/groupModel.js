import rp from 'request-promise';
import fs from 'fs';
import configurator from '../config/configurator';
let config = configurator.get();

function generateGroupName(leaf = "") {
    config = configurator.get();
    let group = config.groupNameBase + (leaf ? leaf : config.groupNameLeaf);
    return group;
}

const options = {
    method: 'GET',
    url: "",
    json: true,
    ca: [fs.readFileSync(__dirname + "/../config/uwca.pem", { encoding: 'utf-8' })],    //UW CA not trusted by nodejs so we must include the UW CA on our request
    agentOptions: {
        pfx: fs.readFileSync(__dirname + "/../" + config.certificate),
        passphrase: config.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
    }
};

const Groups = {
    addMember: (leaf = "", netid) => {
        config = configurator.get();
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: config.groupsBaseUrl + generateGroupName(leaf) + "/member/" + netid,
        });
        return rp(opts).then((res) => {
            return { "updated": true };
        })
    },
    checkGroup: (group) => {
        config = configurator.get();
        let opts = Object.assign({}, options, {
            url: config.groupsBaseUrl + group
        });
        
        return rp(opts).then(res => {
            return { "exists": true };
        }).catch(err => {
            return { "exists": false };
        })
    },
    getMembers: (leaf = "") => {
        config = configurator.get();
        let groupName = generateGroupName(leaf);
        
        let opts = Object.assign({}, options, { 
            url: `${config.groupsBaseUrl}${groupName}/member`,
        });
        let groupInfo = {
            groupName,
            leafName: config.groupNameLeaf,
            users: []
        };
        
        return rp(opts).then((parsedBody) => {
            parsedBody.data.map((i, el) =>{
                groupInfo.users.push({ "netid": i.id });
            });
          return groupInfo;
        }).catch((err) => {
            return Groups.createGroup(groupName).then(() => {
                return groupInfo;
            });
        })
    },
    createGroup: (group = "") => {
        config = configurator.get();

        let admins = [];
        for(var i = 0; i < config.groupAdmins.length; i++) {
            admins.push(config.groupAdmins[i]);
        }

        var groupBody = createNewGroupModel(group, config.groupDisplayName, config.groupDescription, admins)
        //console.error(JSON.stringify(groupBody));
        
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: config.groupsBaseUrl + group,
            body: JSON.stringify(groupBody)
        });

        return rp(opts).then(() => {
            return {"created": true };
        })
        .catch((err) => {
            return {"created": false, "error": err.message };
        })
    },
    createNewGroupModel: (id, displayName, description, admins) => {
        let groupAdmins = [];
        admins.map((i, el) => {
            groupAdmins.push({ "id": i });
        });
        var data = { "id": id, "displayName": displayName, "description": description, "admins": groupAdmins };
        return data;
    },
    getSubGroups: groupName => {
        let opts = Object.assign({}, options, {
            method: 'GET',
            url: `${config.groupsSearchUrl}?name=${groupName}*&type=effective&scope=all`
        })
        return rp(opts).then(parsedBody => {
            let groups = [];
            parsedBody.data.map((i, el) =>{
                groups.push(i.id);
            });
            return groups;
        });
    },
    removeMember: (netid, leaf = "") => {
        config = configurator.get();
        let opts = Object.assign({}, options, { 
            method: 'DELETE',
            url: config.groupsBaseUrl + generateGroupName(leaf) + "/member/" + netid,
        });
        return rp(opts).then(() => {
            return { "deleted": true };
        })
        .catch((err) => {
            return {"deleted": false, "error": err.message};
        })
    },
    removeGroup: (leaf) => {
        config = configurator.get();
        let opts = Object.assign({}, options, { 
            method: 'DELETE',
            url: config.groupsBaseUrl + leaf,
        });
        return rp(opts).then(() => {
            return { "deleted": true };
        })
        .catch((err) => {
            return { "deleted": false, "error": err.message}
        })
    }
}

export default Groups;