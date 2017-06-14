import groups from '../models/groups';
import { Router } from 'express';

let api = Router();

api.get('/', (req, res) => {
    res.json(groups.get());
});

export default api;


