import idcard from './idcardModel';
import pws from './pwsModel';
import groups from './groupModel';
import config from '../config.json';

// Fill out model, this could be very spammy and slow with a long attendee list
function verbosifyMemberList(groupInfo) {
    console.log(groupInfo)
    var promises = groupInfo.users.map((user) => {
        return pws.get(user.netid).then((u) => {
            return {
                "netid": u.UWNetID,
                "regid": u.UWRegID,
                "preferredName": u.PreferredFirstName + ' ' + u.PreferredSurname
            }
        }).catch((err) => {
            return {
                "netid": user.netid,
                "error": "could not find user details"
            }
        })
        
    });
    return Promise.all(promises).then((people) => {
        var imagePromises = people.map((p) => {
            return idcard.getPhoto(p.regid).then((image) => {
                p.base64image = image;
                return p;
            })
            .catch(() => {
                return p;
            })
        });
        return Promise.all(imagePromises).then((result) => {
            groupInfo.users = result;
            return groupInfo;
        });
    });
    
}

let memStorage = { groupName: "internalStorage", users: []};

export default {
    add: (cardId) => {
        return idcard.get(cardId).then((regId) => {
            return pws.get(regId).then((result) => {
                return result;
            })
        })
        .then((personDetails) => {
            if(config.storeInGroupsWS) { 
                return groups.addMember("", personDetails.UWNetID).then((result) => {
                    return { "updated": true };
                });
            } else {
                return new Promise((resolve, reject) => {
                    memStorage.users.push({"netid": personDetails.UWNetID });
                    resolve({ "updated": true });    
                })
            }
        });
    },
    list: () => {
        return new Promise((resolve, reject) => {
            if(config.storeInGroupsWS) {
                resolve(groups.getMembers());
            } else {
                resolve(memStorage);
            }
            
        }).then((members) => {
            console.log(members);
            if(config.registerListVerbose) {
                return verbosifyMemberList(members);      
            }
        });
    },
    remove: (netid, groupName) => {
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