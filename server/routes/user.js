const router = require('express').Router();
const db = require('monk')('mongodb://localhost/contribeautiful');
const ObjectId = require('mongodb').ObjectID;

router.get('/:id', async(req, res) => {
	const id = req.params.id;
	if(!ObjectId.isValid(id)) {
		res.sendStatus(404);
		return;
	}
	const users = db.get('users');
	const user = await users.findOne({$or: {_id: req.params.id}});
	
	if(user)
		res.send(user);
	else
		res.sendStatus(404);
	db.close();
});

module.exports = router;