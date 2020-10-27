const router = require('express').Router();
const db = require('monk')('mongodb://localhost/contribeautiful');
const ObjectId = require('mongodb').ObjectID;

const users = db.get('users');

router.get('/:id', async(req, res) => {
	const id = req.params.id;
	if(!ObjectId.isValid(id)) {
		res.sendStatus(400);
		return;
	}
	const user = await users.findOne({_id: req.params.id});
	
	if(user)
		res.send(user);
	else
		res.sendStatus(404);
	db.close();
});
router.delete('/:id', async(req, res) => {
	const id = req.params.id;
	if(!ObjectId.isValid(id)) {
		res.sendStatus(400);
		return;
	}
	const user = await users.deleteOne({_id: id});
	res.sendStatus(user ? 204 : 404);
	db.get('graphs').deleteOne({_id: id});
});
module.exports = router;