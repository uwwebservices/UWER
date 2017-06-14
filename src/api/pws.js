import pws from '../models/pws';
import { Router } from 'express';

let api = Router();

api.get('/', (req, res) => {
    res.json(pws.get());
});

export default api;



