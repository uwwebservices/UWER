import config from '../config.json';
import rp from 'request-promise';
import fs from 'fs';
import cheerio from 'cheerio';

const groupName = config.groupNameBase + config.groupNameLeaf;

export default {
    addMember: (groupname = "", netid) => {
        let options = {
            method: 'PUT',
            url: config.groupsBaseUrl + (groupname || groupName) + "/member/" + netid,
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            }
        };
        return rp(options).then((body) => {
            return { "Updated": true };
        })
        .catch((err) => {
            throw err.message;
        })
    },
    getMembers: (groupname = "") => {
        let options = {
            method: 'GET',
            url: config.groupsBaseUrl + (groupname || groupName) + "/member",
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            }
        };
        let groupInfo = {
            groupName: groupname || groupName,
            users: []
        };
        return rp(options).then((body) => {
            let $ = cheerio.load(body);
            $('.member').map((i, el) => {;
                groupInfo.users.push($(el).html());
            });
            return groupInfo;
        })
        .catch((err) => {
            throw err.message;
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
        console.log(htmlPut);
        let options = {
            method: 'PUT',
            url: config.groupsBaseUrl + groupName,
            headers: {
                "content-type":"application/xhtml+xml"
            },
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            },
            body: htmlPut
        };
        return rp(options).then((body) => {
            return {"Created": true };
        })
        .catch((err) => {
            throw err.message;
        })
    },
    removeMember: (groupname, netid) => {
        let options = {
            method: 'DELETE',
            url: config.groupsBaseUrl + (groupname || groupName) + "/member/" + netid,
            agentOptions: {
                pfx: fs.readFileSync(config.certificate),
                passphrase: config.passphrase,
                securityOptions: 'SSL_OP_NO_SSLv3'
            }
        };
        return rp(options).then((body) => {
            return { "Deleted": true };
        })
        .catch((err) => {
            throw err.message;
        })
    }
}