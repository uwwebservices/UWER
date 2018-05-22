import rp from 'request-promise';
import fs from 'fs';
import configurator from 'utils/configurator';
let config = configurator.get();

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
            return SuccessResponse(res.data, res.error);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async RemoveMember(group, netid) {
        let opts = Object.assign({}, options, { 
            method: 'DELETE',
            url: `${config.groupsBaseUrl}/${group}/member/${netid}`
        });
        try {
            let res = await rp(opts);
            return SuccessResponse(res.errors[0], res.errors[0].status);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async CreateGroup(group) {
        var groupBody = {
            "data" : { 
                "id": group, 
                "displayName": config.groupDisplayName, 
                "description": config.groupDescription, 
                "admins": config.groupAdmins.map(admin => {
                    return {"id": admin, "type": "dns" };
                })
            }
        };

        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: `${config.groupsBaseUrl}/${group}`,
            body: groupBody
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
            url: `${config.groupsBaseUrl}/${group}`
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