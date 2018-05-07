import pws from 'models/pwsModel';
import { Router } from 'express';

let api = Router();

api.get('/:regId', (req, res) => {
    pws.get(req.params.regId)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.status(err.statusCode).json({"error": err.message});
        })
});

export default api;



