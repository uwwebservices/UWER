import idcard from '../models/idcard';
import { Router } from 'express';

export default ({config}) => {
    let api = Router();

    api.get('/', (req, res) => {
        res.json(idcard.get());
    });
    
    return api;
}


