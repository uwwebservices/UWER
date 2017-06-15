import idcard from './idcardModel';
import pws from './pwsModel';
import groups from './groupModel';
import config from '../config.json';

// Fill out the user list with netid/regid/preferredname/base64image
function verbosifyMemberList(groupInfo) {
    var promises = groupInfo.users.map((user) => {
        return pws.get(user.netid).then((u) => {
            return {
                "netid": u.UWNetID,
                "regid": u.UWRegID,
                "preferredName": u.PreferredFirstName + ' ' + u.PreferredSurname
            }
        })
    });
    return Promise.all(promises).then((people) => {
        var imagePromises = people.map((p) => {
            return idcard.getPhoto(p.regid).then((image) => {
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

export default {
    add: (cardId) => {
        return idcard.get(cardId).then((regId) => {
            return pws.get(regId).then((result) => {
                return result;
            })
        })
        .then((personDetails) => {
            return groups.addMember("", personDetails.UWNetID).then((result) => {
                return { "updated": true };
            });
        });
    },
    list: () => {
        if(config.registerListVerbose) {
            return groups.getMembers().then(verbosifyMemberList);
        } else {
            return groups.getMembers();
        }
        
    },
    remove: (netid, groupName) => {
        return groups.removeMember(netid, groupName);
    }
}