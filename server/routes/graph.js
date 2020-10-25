const router = require('express').Router();
const db = require('monk')('mongodb://localhost/contribeautiful');

router.post('/', (req, res) => {
	res.send(req.body);
});

module.exports = router;