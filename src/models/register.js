import idcard from './idcard';
import pws from './pws';
import groups from './groups';
import register from './register';
import config from '../config.json';

let users = [];
export default {
    add: (cardId) => {
        // Use magstrip/rfid to call IDCard and get RegID
        return idcard.get(cardId).then((regId) => {
            // Call PWS with RegID to get person info
            return pws.get(regId).then((result) => {
                return result;
            })
        })
        // Add user found to group
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