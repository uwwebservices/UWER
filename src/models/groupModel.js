import config from '../config/config.json';
import rp from 'request-promise';
import fs from 'fs';
import cheerio from 'cheerio';

const groupName = config.groupNameBase + config.groupNameLeaf;

const options = {
    method: 'GET',
    url: "",
    agentOptions: {
        pfx: fs.readFileSync(config.certificate),
        passphrase: config.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
    }
};

export default {
    addMember: (groupname = "", netid) => {
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: config.groupsBaseUrl + (groupname || groupName) + "/member/" + netid,
        });
        return rp(opts).then(() => {
            return { "updated": true };
        })
        .catch((err) => {
            throw err;
        })
    },
    getMembers: (groupname = "") => {
        let opts = Object.assign({}, options, { 
            url: config.groupsBaseUrl + (groupname || groupName) + "/member",
        });
        let groupInfo = {
            groupName: groupname || groupName,
            users: []
        };
        return rp(opts).then((body) => {
            let $ = cheerio.load(body);
            $('.member').map((i, el) => {
                groupInfo.users.push({ "netid": $(el).html() });
            });
            return groupInfo;
        })
        .catch((err) => {
            throw err;
        })
    },
    createGroup: (groupname = "") => {
        let admins = "";
        for(var i = 0; i < config.groupAdmins.length; i++) {
            admins += `<li class="admin">${config.groupAdmins[i]}</li>`;
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
                <ul class="names"><li class="name">${groupname || groupName}</li></ul>
                <ul class="admins">
                    ${admins}
                </ul>
                </div>
            </body>
            </html>
        `;
        
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: config.groupsBaseUrl + groupName,
            headers: {
                "content-type":"application/xhtml+xml"
            },
            body: htmlPut
        });
        return rp(opts).then(() => {
            return {"created": true };
        })
        .catch((err) => {
            throw err;
        })
    },
    removeMember: (netid, groupname = "") => {
        let opts = Object.assign({}, options, { 
            method: 'DELETE',
            url: config.groupsBaseUrl + (groupname || groupName) + "/member/" + netid,
        });
        return rp(opts).then(() => {
            return { "deleted": true };
        })
        .catch((err) => {
            throw err;
        })
    },
    removeGroup: (groupname) => {
        let opts = Object.assign({}, options, { 
            method: 'DELETE',
            url: config.groupsBaseUrl + groupname,
        });
        return rp(opts).then(() => {
            return { "deleted": true };
        })
        .catch((err) => {
            throw err;
        })
    }
}