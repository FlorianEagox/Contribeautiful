const router = require('express').Router();
const db = require('monk')('mongodb://localhost/contribeautiful');
const ObjectId = require('mongodb').ObjectID;

router.get('/:user', async(req, res) => {
	const user = req.params.user;
	if(!ObjectId.isValid(user)) {
		res.sendStatus(404);
		return;
	}

	const graphs = db.get('graphs');
	const graph = await graphs.findOne({_id: req.params.user});
	if(!graph)
		res.status(404);
	res.send(graph);
});
router.post('/', async(req, res) => {
	console.log(req.body);
	const {user, trim, time} = req.body;
	let {commitData} = req.body;
	const graphs = db.get('graphs');
	if(trim)
		commitData = commitData.filter(arr => arr.reduce((val, sum) => sum + val));
	const graph = await graphs.findOneAndUpdate({_id: user}, {$set: {commitData, ... true && {time}}}, {upsert: true});
	res.status(201).send(graph);
});

module.exports = router;