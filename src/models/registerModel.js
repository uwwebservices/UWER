import idcard from './idcardModel';
import pws from './pwsModel';
import groups from './groupModel';
import configurator from '../config/configurator';
let config = configurator.get();

// If verbose flag passed, verbosify the users
function verbosifyMemberList(groupInfo) {
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
                .catch(() => {
                    return p;
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
    list: (verbose) => {
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
            if(verbose) {
                return verbosifyMemberList(members);      
            } else {
                return members;
            }
        }).catch((err) => {
            if(err.statusCode === 404) {
                return groups.createGroup().then(() => {
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
                    })
                })
            } else {
                throw err;
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