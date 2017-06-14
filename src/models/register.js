import idcard from './idcard';
import pws from './pws';
import groups from './groups';
import register from './register';
import config from '../config.json';

let users = [];
export default {
    add: (netid) => {
        if(users.indexOf(netid) < 0){
            users.push(netid);
            return true;
        } else {
            return false;
        }
    },
    list: () => {
        return users;
    },
    delete: (netid) => {
        users.pop(netid);
        return users;
    }
}