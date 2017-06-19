import { Router } from 'express';

let api = Router();

api.get('/', (req, res) => {
	 res.sendFile(__dirname + '/index.html');
});

export default api;