import idcard from '../models/idcard';
import { Router } from 'express';

let api = Router();

api.get('/:cardNum', (req, res) => {
    idcard.get(req.params.cardNum)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json({"Error": err});
        });
});

api.get('/photo/:regId', (req, res) => {
    idcard.getPhoto(req.params.regId)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json({"Error": err});
        });
});

export default api;

