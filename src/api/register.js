import register from '../models/register';
import { Router } from 'express';

let api = Router();

api.get('/list', (req, res) => {
    res.json(register.list());
});

api.post('/:netid', (req, res) => {
    if(register.add(req.params.netid)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

api.delete('/:netid', (req, res) => {
    register.delete(req.params.netid);
    res.sendStatus(200);
});

export default api;



