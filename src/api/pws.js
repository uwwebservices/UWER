import pws from '../models/pws';
import { Router } from 'express';

let api = Router();

api.get('/:regId', (req, res) => {
    pws.get(req.params.regId)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json({"Error": err});
        });
});

export default api;



