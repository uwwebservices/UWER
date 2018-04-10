import idcard from '../models/idcardModel';
import { Router } from 'express';

let api = Router();

api.get('/:cardNum', (req, res) => {
    try {
        idcard.get(req.params.cardNum)
            .then((response) => {
                res.json(response);
            })
            .catch((err) => {
                console.log(err);
                res.status(err.statusCode).json({"error": err.message});
            });
    } catch (err) {
        res.status(err.statusCode).json({"error": err.message});
    }
});

api.get('/photo/:regId', (req, res) => {
    try {
        idcard.getPhoto(req.params.regId)
            .then((response) => {
                res.json(response);
            })
            .catch((err) => {
                res.status(err.statusCode).json({"error": err.message});
            })
    } catch (err) {
        res.status(err.statusCode).json({"error": err.message});
    }
});

export default api;

