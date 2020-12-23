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
	const {login} = await GitUtils.getGitHubProifle(access_token);
	console.log(login)
	const repo = await GitUtils.getRepo(login, access_token);
	GitUtils.commitsFromYear(repo, year, data => {
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
	// Create a repo if the user doesn't already have one.
	const [{login}, [{email}]] = (await Promise.all([
		(await fetch('https://api.github.com/user',        {headers: authHeader(access_token)})).json(),
		(await fetch('https://api.github.com/user/public_emails',  {headers: authHeader(access_token)})).json()
	]));
	const repoReq = await fetch(`https://api.github.com/repos/${login}/contribeautiful_data`);
	if(repoReq.status == 404) { // check if the repo exists
		const repo = await fetch('https://api.github.com/user/repos', {
			method: 'POST',
			headers: {'Authorization': `token ${access_token}`},
			body: JSON.stringify({
				name: 'contribeautiful_data',
				description: 'autogenerated by TheFoxarmy/Contribeautiful',
				homepage: 'https://sethpainter.com/contribeautiful',
				has_issues: false,
				has_projects: false,
				has_wiki: false,
				has_downloads: false,
				auto_init: true
			})
		});
		if(!res.ok)
			res.status(500).send('Failed to create repo');
	}

	const repo = await GitUtils.getRepo(login, access_token);
	const lastID = await GitUtils.makeCommits(repo, year, commitData, login, email);
	res.status(201).send(lastID);

	// const {graph} = await userCol.findOneAndUpdate({_id: user}, {$set: {lastCommit: lastID}});
});

const authHeader = token => {return {'Authorization': `token ${token}`}};

module.exports = router;
