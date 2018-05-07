import groups from 'models/groupModel';
import { Router } from 'express';

let api = Router(); 

api.get('/:groupName', (req, res) => {
     groups.getMembers(req.params.groupName).then(users => {
        res.status(200).json(users);
    })
    .catch((err) => {
        res.status(err.statusCode).json({"error": err.message});
    })
});

api.get('/:groupName/check', (req, res) => {
    groups.checkGroup(req.params.groupName).then(exists => {
        res.status(200).json(exists);
    });
});

api.get('/:groupName/subgroups', (req, res) => {
    groups.getSubGroups(req.params.groupName). then(groups => {
        res.status(200).json(groups);
    });
});

api.post('/:groupName', (req, res) => {
    groups.createGroup(req.params.groupName)
        .then(msg => {
            res.json(msg);
        })
        .catch(err => {
            res.status(err.statusCode).json({"error": err.message});
        })
});

api.put('/:groupName/:netid', (req, res) => {
    groups.addMember(req.params.groupName, req.params.netid)
        .then(added => {
            res.json(added);
        })
        .catch(err => {
            res.status(err.statusCode).json({"error": err.message});
        })
});

api.delete('/:groupName/:netid', (req, res) => {
    groups.removeMember(req.params.netid, req.params.groupName)
        .then(deleted => {
            res.json(deleted);
        })
        .catch(err => {
            res.status(err.statusCode).json({"error": err.message});
        })
});

api.delete('/:groupName', (req, res) => {
    groups.removeGroup(req.params.groupName)
        .then(deleted => {
            res.json(deleted);
        })
        .catch(err => {
            res.status(err.statusCode).json({"error": err.message});
        })
});

export default api;


