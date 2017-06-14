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