import idcard from '../models/idcard';
import { Router } from 'express';

let api = Router();

api.get('/', (req, res) => {
    res.json(idcard.get());
});

export default api;

