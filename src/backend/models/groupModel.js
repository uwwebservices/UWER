import rp from 'request-promise';
import fs from 'fs';
import config from 'config/config.json';

const options = {
    method: 'GET',
    url: "",
    json: true,
    ca: [fs.readFileSync(config.uwca, { encoding: 'utf-8' })],    //UW CA not trusted by nodejs so we must include the UW CA on our request
    agentOptions: {
        pfx: fs.readFileSync(config.certificate),
        passphrase: config.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
    }
};

const SuccessResponse = (Payload, Status=200, ) => {
    return {
        Status,
        Payload
    }
};
const ErrorResponse = ex => {
    return {
        "Status": ex.statusCode,
        "Payload": ex.error.errors
    }
};

const Groups = {
    async AddMember(group, identifier) {
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: `${config.groupsBaseUrl}/${group}/member/${identifier}`
        });
        try {
            let res = await rp(opts);
            return SuccessResponse(res.errors[0], res.errors[0].status);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async GetMembers(group) {
        let opts = Object.assign({}, options, { 
            url: `${config.groupsBaseUrl}/${group}/member`,
        });
        try {
            let res = await rp(opts);
            return SuccessResponse(res.data);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async GetAdmins(group) {
        let opts = Object.assign({}, options, { 
            url: `${config.groupsBaseUrl}/${group}`,
        });
        try {
            let res = await rp(opts);
            let admins = res.data.admins.map((a) => a.id);
            return SuccessResponse(admis, res.error);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async RemoveMember(group, netid) {
        let opts = Object.assign({}, options, { 
            method: 'DELETE',
            url: `${config.groupsBaseUrl}/${group}/member/${netid}?synchronized=true`
        });
        try {
            let res = await rp(opts);
            return SuccessResponse(res.errors[0], res.errors[0].status);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async CreateGroup(group) {
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: `${config.groupsBaseUrl}/${group}?synchronized=true`,
            body: {
                "data" : { 
                    "id": group, 
                    "displayName": config.groupDisplayName, 
                    "description": config.groupDescription, 
                    "admins": config.groupAdmins.map(admin => {
                        return {"id": admin, "type": "dns" };
                    })
                }
            }
        });
        
        try {
            let res = await rp(opts);
            return SuccessResponse(res.data)
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async SearchGroups(group) {
        let opts = Object.assign({}, options, {
            method: 'GET',
            url: `${config.groupsSearchUrl}?name=${group}*&type=effective&scope=all`
        });
        try {
            let res = await rp(opts);
            return SuccessResponse(res.data)
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async DeleteGroup(group) {
        let opts = Object.assign({}, options, { 
            method: 'DELETE',
            url: `${config.groupsBaseUrl}/${group}?synchronized=true`
        });
        try {
            let res = await rp(opts);
            return SuccessResponse(res.errors[0], res.errors[0].status);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    }
};

export default Groups;