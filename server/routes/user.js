const router = require('express').Router();
const db = require('monk')('mongodb://localhost/contribeautiful');
const ObjectId = require('mongodb').ObjectID;
const fs = require('fs');


router.get('/:id', async(req, res) => {
	const id = req.params.id;
	if(!ObjectId.isValid(id))
		return res.sendStatus(400);
	
	const users = db.get('users');
	const user = await users.findOne({_id: req.params.id});
	
	if(user)
		res.send(user);
	else
		res.sendStatus(404);
	db.close();
});

router.delete('/:id', async(req, res) => {
	const { id } = req.params;
	if(!ObjectId.isValid(id))
		return res.sendStatus(400);
	try {
		const users = db.get('users');
		const user = await users.remove({_id: id});
		fs.rm(`repos/${id}`, { recursive: true }, () => {}); // For whatever reason, this needs a callback, even though I don't want to wait for delete to finish.
		res.sendStatus(user ? 204 : 400);
	} catch(error) {
		res.status(400).send(`Something went wrong Deleting this user ${error}`);
	}
});
module.exports = router;
