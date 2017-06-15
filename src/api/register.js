import register from '../models/registerModel';
import { Router } from 'express';

let api = Router();

api.get('/', (req, res) => {
    register.list().then((result) => {
        res.json(result);
    });
});

api.put('/:cardId', (req, res) => {
    register.add(req.params.cardId).then((result) => {
        res.json(result);
    })
    .catch((err) => {
        res.json({"Error": err});
    })
});

api.delete('/:netid', (req, res) => {
    register.remove(req.params.netid).then((result) => {
        res.json(result);
    })
    .catch((err) => {
        res.json({"Error": err});
    })
});

export default api;



