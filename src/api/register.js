import register from '../models/registerModel';
import { Router } from 'express';

let api = Router();

api.get('/', (req, res) => {
    let verbose = req.query.verbose == 'true' ? true : false;
    register.list(verbose).then((result) => {
        res.json(result);
    })
    .catch((err) => {
        res.status(err.statusCode).json({"error": err.message});
    })
});

api.put('/:identifier', (req, res) => {
    let verbose = req.query.verbose == 'true' ? true : false;
    register.add(req.params.identifier, verbose).then((result) => {
        res.json(result);
    })
    .catch((err) => {
        res.status(err.statusCode).json({"error": err.message});
    })
});

api.delete('/:netid', (req, res) => {
    register.remove(req.params.netid).then((result) => {
        res.json(result);
    })
    .catch((err) => {
        res.status(err.statusCode).json({"error": err.message});
    })
});

export default api;



