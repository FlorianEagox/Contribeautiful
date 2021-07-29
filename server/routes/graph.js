const router = require('express').Router();
const fetch = require('node-fetch');
const db = require('monk')('mongodb://localhost/contribeautiful');
const ObjectId = require('mongodb').ObjectID;
const GitUtils = require('../GitUtils');

const updateProgressTiming = 200; // How often the progress of repo modification requests should be sent.

router.get('/:user/:year', async(req, res) => {
	const {user, year} = req.params;
	if(!ObjectId.isValid(user))
		return res.sendStatus(404);

	const users = db.get('users');
	const {access_token} = await users.findOne({_id: req.params.user});
	if(!access_token)
		return res.status(404);
	const {login} = await GitUtils.getGitHubProifle(access_token); // Resolves our access token to a github userID
	const repo = await GitUtils.getRepo(login, access_token, req.params.user); // open the repo of the user
	const data = await GitUtils.commitsBetweenDates(repo, new Date(year,  0,  1), new Date(year, 11, 31)); // go through every commit in the repo, and make a list of every date in the year with the value of how many comits happend on that day.
	if(!data?.every(item => item == 0))
		res.send(JSON.stringify(data));
	else
		res.status(404).send();
});

router.post('/', updateGraph);

router.patch('/', updateGraph);

async function updateGraph(req, res) {
	res.setHeader('Content-Type', 'text/html'); // This is a hack, browsers won't stream response body of text/plain
	const {user, year, commitData} = req.body;
	const userCol = db.get('users');
	const {access_token} = await userCol.findOne({_id: user});
	// Get the email and username of the logged in user
	const [{login}, [{email}]] = (await Promise.all([
		await GitUtils.getGitHubProifle(access_token),
		(await fetch('https://api.github.com/user/public_emails',  {headers: {'Authorization': `token ${access_token}`}})).json()
	]));

	const repo = await GitUtils.getRepo(login, access_token, user); // Clone or open the repo
	let commitProgress = [0];
	let prevProgress = 0;
	res.write('total ' + GitUtils.computeTotalCommits(commitData));
	const updateProgressInterval = setInterval(() => {
		if(commitProgress[0] && commitProgress[0] != prevProgress) { // If the progress of the task hasn't changed, don't send any data
			res.write(commitProgress[0].toString());
			prevProgress = commitProgress[0];
		}
	}, updateProgressTiming);
	
	try {
		const lastID = await GitUtils.makeCommits(repo, year, commitData, login, email, user, commitProgress); // Make all the commits and get the last ID
		await userCol.findOneAndUpdate({_id: user}, {$set: {lastCommit: lastID}});
		res.write('lastid ' + lastID);
	} catch(e) {
		res.status(500).write(`error ${JSON.stringify(e)}`);
	}
	clearInterval(updateProgressInterval);
	res.send();
}

module.exports = router;
