import rp from 'request-promise';
import fs from 'fs';
import config from 'config/config.json';
import { FilterModel } from '../utils/helpers';

const options = {
    method: 'GET',
    url: "",
    json: true,
    ca: [
            fs.readFileSync(config.incommon, { encoding: 'utf-8'})
        ],    
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

// Sample GetGroup Response
// { regid: '75fbe2c29f954b7d9c8815f45c45067e',
//   id: 'uw_ais_sm_ews_registration_dev_chris-test-group',
//   displayName: 'UW Registration POC',
//   description: 'This a test group for UW Registration POC',
//   created: 1535558330366,
//   lastModified: 1535558333614,
//   lastMemberModified: 1538661821973,
//   contact: '',
//   authnFactor: '1',
//   classification: 'u',
//   dependsOn: '',
//   gid: '534598',
//   affiliates: [ { name: 'email', status: 'inactive', senders: [] } ],
//   admins:
//    [ { type: 'dns',
//        name: 'aisdev.cac.washington.edu',
//        id: 'aisdev.cac.washington.edu' } ],
//   updaters: [],
//   creators: [],
//   readers: [ { type: 'set', id: 'all' } ],
//   optins: [],
//   optouts: [] }

const GetGroupInfo = async group => {
    let opts = Object.assign({}, options, { 
        method: 'GET',
        url: `${config.groupsBaseUrl}/${group}`
    });
    try {
        let res = await rp(opts);
        return res.data;
    } catch(ex) {
        throw ex;
    }
};


const Groups = {
    async IsConfidentialGroup(group) {
        return (await GetGroupInfo(group)).classification === "c";
    },
    async UpdateGroup(group) {
        return false;
    },
    async AddMember(group, identifier) {
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: `${config.groupsBaseUrl}/${group}/member/${identifier}`
        });
        try {
            let res = await rp(opts);
            if(res.errors[0].notFound.length > 0) {
                return ErrorResponse({statusCode: 404, error: {errors: "User Not Found"}});
            }
            return SuccessResponse(res.errors[0], res.errors[0].status);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async GetMembers(group, force=false) {        
        let opts = Object.assign({}, options, { 
            url: `${config.groupsBaseUrl}/${group}/member${force ? '?source=registry' : ''}`
        });
        try {
            let res = await rp(opts);
            
            return SuccessResponse(res.data, res.error);
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async GetAdmins(group) {
        try {
            let g = await GetGroupInfo(group);
            let admins = g.admins.map((a) => a.id);
            return SuccessResponse(admins);
        } catch(ex) {
            console.log(ex)
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
    async CreateGroup(group, confidential, description, email) {
        let classification = confidential == "false" ? "u" : "c";
        let readers = confidential == "false" ? [] : [ { "type": "set", "id": "none"} ]; 
        let opts = Object.assign({}, options, { 
            method: 'PUT',
            url: `${config.groupsBaseUrl}/${group}?synchronized=true`,
            body: {
                "data" : { 
                    "id": group, 
                    "displayName": config.groupDisplayName, 
                    "description": description,
                    "admins": config.groupAdmins.map(admin => {
                        if(admin.indexOf('.edu') > -1) {
                            return {"id": admin, "type": "dns" };
                        } else {
                            return {"id": admin, "type": "uwnetid"};
                        }
                        
                    }),
                    "readers": readers,
                    classification
                }
            }
        });
        
        try {
            let res = await rp(opts);
            if(email === "true") {
               rp(Object.assign({}, options, {
                    method: 'PUT',
                    url: `${config.groupsBaseUrl}/${group}/affiliate/google?status=active&sender=member`
                }));
            }
            return SuccessResponse(res.data)
        } catch(ex) {
            return ErrorResponse(ex);
        }
    },
    async SearchGroups(group, verbose=false) {
        let opts = Object.assign({}, options, {
            method: 'GET',
            url: `${config.groupsSearchUrl}?name=${group}*&type=effective&scope=all`
        });
        console.log(opts.url)
        try {
            let data = (await rp(opts)).data;
            if(verbose) {
                let promises = [];
                let verboseGroups = [];
                await Promise.all(data.map(g => {
                    return GetGroupInfo(g.regid).then((vg) => {
                        if(vg.affiliates.length > 1) {
                            vg.email = `${vg.id}@uw.edu`;
                        }
                        verboseGroups.push(vg);
                    });
                }));
                let filter = ["regid", "displayName", "id", "url", "description", "classification", "email"];
                verboseGroups = verboseGroups.map(vg => {
                    return FilterModel(vg, filter);
                });
                data = verboseGroups;
            }
            return SuccessResponse(data.sort(function(a, b){return a.id < b.id}))
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