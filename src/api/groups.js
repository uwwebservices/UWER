import groups from '../models/groups';
import { Router } from 'express';

let api = Router();

function getGroups(groupName = "") {
    return groups.getMembers(groupName).then((users) => {
        return users;
    })
    .catch((err) => {
        return {"Error": err};
    })
}

api.get('/:groupName', (req, res) => {
    getGroups(req.params.groupName).then((users) => {
        res.json(users);
    });
});

api.post('/:groupName', (req, res) => {
    groups.createGroup(req.params.groupName)
        .then((msg) => {
            res.json(msg);
        })
        .catch((err) => {
            res.json({"Error": err});
        })
});

api.put('/:groupName/:netid', (req, res) => {
    groups.addMember(req.params.groupName, req.params.netid)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json({"Error": err});
        })
});

api.delete('/:groupName/:netid', (req, res) => {
    groups.removeMember(req.params.groupName, req.params.netid)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json({"Error": err});
        });
});

api.delete('/:groupName', (req, res) => {
    groups.removeGroup(req.params.groupName)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json({"Error": err});
        });
});

export default api;


