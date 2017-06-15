import idcard from './idcardModel';
import pws from './pwsModel';
import groups from './groupModel';
import config from '../config.json';

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
        return groups.getMembers();
    },
    remove: (netid, groupName) => {
        return groups.removeMember(netid, groupName);
    }
}