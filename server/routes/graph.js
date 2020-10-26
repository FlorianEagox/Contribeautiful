const router = require('express').Router();
const db = require('monk')('mongodb://localhost/contribeautiful');

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