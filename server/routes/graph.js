const router = require('express').Router();
const fetch = require('node-fetch');
const db = require('monk')('mongodb://localhost/contribeautiful');
const ObjectId = require('mongodb').ObjectID;
const GitUtils = require('../GitUtils');

const updateProgressTiming = 200; // How often the progress of repo modification requests should be sent.

router.get('/:user/:year', async(req, res) => {
	try {
		const {user, year} = req.params;
		if(!ObjectId.isValid(user))
			return res.sendStatus(404);

		const users = db.get('users');
		const {access_token} = await users.findOne({_id: req.params.user});
		if(!access_token)
			return res.status(404);
		const repo = await GitUtils.getRepo(req.params.user);
		// go through every commit in the repo, and make a list of every date in the year with the value of how many comits happend on that day.
		const data = await GitUtils.graphFromYear(repo, year);
		// If all the data in the graph is just zeros, send 404 because there have been no commits made for that year
		if(!data?.every(item => item == 0))
			res.send(JSON.stringify(data));
		else
			res.status(404).send();
	} catch(e) {
		res.status(500).send(`Something went wrong trying to fetch commits. ${JSON.stringify(e)}`);
	}
});

router.post('/', updateGraph);

router.patch('/', (req, res) => updateGraph(req, res, true));

async function updateGraph(req, res, editing = false) {
	let updateProgressInterval;
	try {
		res.setHeader('Content-Type', 'text/html'); // This is a hack, browsers won't stream response body of text/plain
		const {user, year, commitData} = req.body;
		const userCol = db.get('users');
		const {access_token} = await userCol.findOne({_id: user});
		// Get the email and username of the logged in user
		const [{login}, [{email}]] = (await Promise.all([
			await GitUtils.getGitHubProifle(access_token),
			(await fetch('https://api.github.com/user/public_emails',  {headers: {'Authorization': `token ${access_token}`}})).json()
		]));

		const repo = await GitUtils.getRepo(user); // Clone or open the repo
		let commitProgress = [0]; // This is an array so we can use pass by reference (very cheeky indeed)
		let prevProgress = 0;
		res.write('total ' + GitUtils.computeTotalCommits(commitData));
		// Send progress updates every x milliseconds
		updateProgressInterval = setInterval(() => {
			if(commitProgress[0] && commitProgress[0] != prevProgress) { // If the progress of the task hasn't changed, don't send any data
				res.write(commitProgress[0].toString());
				prevProgress = commitProgress[0];
			}
		}, updateProgressTiming);

		const lastID = await GitUtils.makeCommits(repo, year, commitData, login, email, user, commitProgress, editing); // Make all the commits and get the last ID
		await userCol.findOneAndUpdate({_id: user}, {$set: {lastCommit: lastID}});
		res.write('lastid ' + lastID);
	} catch(e) {
		console.log(e)
		res.status(500).write(`error ${JSON.stringify(e)}`);
	}
	clearInterval(updateProgressInterval); // We're done, stop sending progress updates
	res.send();
}

module.exports = router;
