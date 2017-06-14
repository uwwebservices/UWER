import groups from '../models/groups';
import { Router } from 'express';

export default ({config}) => {
    let api = Router();

    api.get('/', (req, res) => {
        res.json(groups.get());
    });
    
    return api;
}


