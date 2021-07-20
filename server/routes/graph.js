const router = require('express').Router();
const fetch = require('node-fetch');
const db = require('monk')('mongodb://localhost/contribeautiful');
const ObjectId = require('mongodb').ObjectID;
const GitUtils = require('../GitUtils');

router.get('/:user/:year', async(req, res) => {
	const {user, year} = req.params;
	if(!ObjectId.isValid(user)) {
		res.sendStatus(404);
		return;
	}

	const users = db.get('users');
	const {access_token} = await users.findOne({_id: req.params.user});
	if(!access_token)
		res.status(404);
	const {login} = await GitUtils.getGitHubProifle(access_token); // Resolves our access token to a github userID
	const repo = await GitUtils.getRepo(login, access_token); // open the repo of the user
	GitUtils.commitsFromYear(repo, year, data => { // go through every commit in the repo, and make a list of every date in the year with the value of how many comits happend on that day.
		if(!data?.every(item => item == 0))
			res.send(JSON.stringify(data));
		else
			res.status(404).send();
	});
});
router.post('/', async(req, res) => {
	const {user, year, commitData} = req.body;
	const userCol = db.get('users');
	const {access_token} = await userCol.findOne({_id: user});
	// Get the email and username of the logged in user
	const [{login}, [{email}]] = (await Promise.all([
		(await fetch('https://api.github.com/user',        {headers: authHeader(access_token)})).json(),
		(await fetch('https://api.github.com/user/public_emails',  {headers: authHeader(access_token)})).json()
	]));

	const repo = await GitUtils.getRepo(login, access_token); // Clone or open the repo
	const lastID = await GitUtils.makeCommits(repo, year, commitData, login, email); // Make all the commits and get the last ID
	
	const updatedUser = await userCol.findOneAndUpdate({_id: user}, {$set: {lastCommit: lastID}});
	
	res.status(201).send(lastID);
});
router.patch('/', async(req, res) => {
	const {user, year, commitData} = req.body;
	const userCol = db.get('users');
	const {access_token, lastCommit} = await userCol.findOne({_id: user});
	// Get the email and username of the logiged n user
	const [{login}, [{email}]] = (await Promise.all([
		(await fetch('https://api.github.com/user',        {headers: authHeader(access_token)})).json(),
		(await fetch('https://api.github.com/user/public_emails',  {headers: authHeader(access_token)})).json()
	]));

	const repo = await GitUtils.getRepo(login, access_token, lastCommit); // Clone or open the repo
	const lastID = await GitUtils.update(repo, year, commitData, login, email); // Make all the commits and get the last ID
	if(lastID) // If any new commits were made, add the latest sha to the DB
		await userCol.findOneAndUpdate({_id: user}, {$set: {lastCommit: lastID}});
	
	res.status(201).send(lastID);
});
const authHeader = token => {return {'Authorization': `token ${token}`}};

module.exports = router;
