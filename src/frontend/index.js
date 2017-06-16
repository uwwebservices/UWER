import { Router } from 'express';

let api = Router();

api.get('/', (req, res) => {
	res.json({ "hello": "hello" });
});

export default api;