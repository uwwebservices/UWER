import pws from '../models/pws';
import { Router } from 'express';

export default ({config}) => {
    let api = Router();

    api.get('/', (req, res) => {
        res.json(pws.get());
    });
    
    return api;
}


