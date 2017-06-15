import idcard from './idcard';
import pws from './pws';
import groups from './groups';
import register from './register';
import config from '../config.json';

let users = [];
export default {
    add: (cardId) => {
        return idcard.get(cardId).then((regId) => {
            return pws.get(regId).then((result) => {
                return idcard.getPhoto(regId).then((photo) => {
                    result.Base64Photo = photo;
                    return result;
                })
            })
        })
        .then((personDetails) => {
            
            return personDetails;
            // need to finish groups model first
            // return groups.add(personDetails).then(() => {
            //     return personDetails;
            // });
        });
    },
    list: () => {
        return groups.getMembers();
    },
    remove: () => {
        return groups.remove();
    },
    clear: () => {
        return groups.clear();
    }
}