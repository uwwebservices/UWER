import idcard from './idcardModel';
import pws from './pwsModel';
import groups from './groupModel';
import configurator from '../config/configurator';
let config = configurator.get();

// verboseLevel = 0: netid
// verboseLevel = 1: netid, regId, preferredName
// verboseLevel = 2: netid, regId, preferredName, base64image
function verbosifyMemberList(groupInfo, verboseLevel) {
    var promises = groupInfo.users.map((user) => {
        return pws.get(user.netid).then((u) => {
            return personToMember(u);
        }).catch((err) => {
            return {
                "netid": user.netid,
                "error": "could not find user details"
            }
        })
    });
    if(verboseLevel > 1) {
        return Promise.all(promises).then((people) => {
            var imagePromises = people.map((p) => {
                return getPhoto(p.regid).then((image) => {
                    p.base64image = image;
                    return p;
                });
            });
            return Promise.all(imagePromises).then((result) => {
                groupInfo.users = result;
                return groupInfo;
            });
        });
    } else {
        return Promise.all(promises).then((result) => {
            groupInfo.users = result;
            return groupInfo;
        })
    }
    
    
}

function personToMember(person) {
    return { "netid": person.UWNetID, "regid": person.UWRegID, "preferredName": person.PreferredFirstName + ' ' + person.PreferredSurname }
}

function getPhoto(regid) {
    return idcard.getPhoto(regid).then((image) => {
        return image;
    });
}

let memStorage = { groupName: "internalStorage", users: []};

export default {
    add: (identifier, verbose) => {
        config = configurator.get();
        let promise;
        let card = idcard.validCard(identifier);
        if(card) {
            promise = idcard.get(card).then((regId) => {
                return pws.get(regId);
            });
        } else {
            promise = pws.get(identifier);
        }
        
        return promise.then((personDetails) => {
            if(config.storeInGroupsWS) { 
                return groups.addMember("", personDetails.UWNetID).then((result) => {
                    if(verbose) {
                        let pers = personToMember(personDetails); 
                        return getPhoto(pers.regid).then((image) => {
                            pers.base64image = image;
                            return pers;
                        });
                    } else {
                        return { netid: personDetails.UWNetID }
                    }
                })
                .catch((err) => {
                    console.log("ERROR", err);
                })
            } else {
                return new Promise((resolve, reject) => {
                    memStorage.users.push({"netid": personDetails.UWNetID });
                    if(verbose) {
                        let pers = personToMember(personDetails); 
                        resolve(getPhoto(pers.regid).then((image) => {
                            pers.base64image = image;
                            return pers;
                        }));
                    } else {
                        return { netid: personDetails.UWNetID }
                    }
                })
            }
        });
    },
    list: (verboseLevel) => {
        config = configurator.get();
        
        return new Promise((resolve, reject) => {
            if(config.storeInGroupsWS) {
                groups.getMembers().then(mems => {
                    mems.configEnabled = config.enableConfigAPI;
                    resolve(mems);
                });
            } else {
                memstorage.configEnabled = config.enableConfigAPI;
                resolve(memStorage);
            }
            
        }).then((members) => {
            if(verboseLevel && verboseLevel > 0) {
                return verbosifyMemberList(members, verboseLevel);      
            } else {
                return members;
            }
        })
    },
    remove: (netid, groupName) => {
        config = configurator.get();
        if(config.storeInGroupsWS) {
            return groups.removeMember(netid, groupName);
        } else {
            memStorage.pop(netid);
            return new Promise((resolve, reject) => {
                resolve({ "updated": true });    
            });
        }
    }
}