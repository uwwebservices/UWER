import rp from 'request-promise';
import fs from 'fs';
import cheerio from 'cheerio';
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
            ca: [fs.readFileSync(__dirname + "/../config/uwca.pem", { encoding: 'utf-8' })],    //UW CA not trusted by nodejs so we must include the UW CA on our request
        });
        let groupInfo = {
            groupName,
            leafName: config.groupNameLeaf,
            users: []
        };
        
        return rp(opts).then((body) => {
            let $ = cheerio.load(body);
            $('.member').map((i, el) => {
                groupInfo.users.push({ "netid": $(el).html() });
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
        let admins = "";
        for(var i = 0; i < config.groupAdmins.length; i++) {
            admins += `<li class="admin" type="dns">${config.groupAdmins[i]}</li>`;
        }
        let htmlPut = `
            <!DOCTYPE html PUBLIC " -//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11/dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
                <head>
                    <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
                        </head>
                        <body>
                        <div class="group">
                <span class="description">${config.groupDescription}</span>
                <span class="title">${config.groupDisplayName}</span>
                <ul class="names"><li class="name">${group}</li></ul>
                <ul class="admins">
                    ${admins}
                </ul>
                </div>
            </body>
            </html>
        `;
        
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: config.groupsBaseUrl + group,
            headers: {
                "content-type":"application/xhtml+xml"
            },
            body: htmlPut
        });
        
        return rp(opts).then(() => {
            return {"created": true };
        })
        .catch((err) => {
            return {"created": false, "error": err.message };
        })
    },
    getSubGroups: groupName => {
        let opts = Object.assign({}, options, {
            method: 'GET',
            url: `${config.groupsSearchUrl}?name=${groupName}&type=effective&scope=all`
        })
        return rp(opts).then(body => {
            let $ = cheerio.load(body);
            let groups = [];
            $('.groupreference .name').map((i, el) => {
                groups.push($(el).html());
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