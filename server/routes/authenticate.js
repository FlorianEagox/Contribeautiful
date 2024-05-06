const router = require('express').Router();
const { existsSync } = require('fs');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const db = require('monk')('mongodb://localhost/contribeautiful');
const GitUtils = require('../GitUtils');

const tokenUrl = 'https://github.com/login/oauth/access_token';
const clientUrl = process.env.VUE_APP_SERVER_BASE_URL;

router.get('/', async(req, res) => {
	if(!req.query?.code) { // make sure we get a code
		res.status(400).send('No code :(');
		return;
	}
	const params = new URLSearchParams();
	params.append('client_id', process.env.VUE_APP_GH_CLIENT_ID);
	params.append('client_secret', process.env.GH_CLIENT_SECRET);
	params.append('code', req.query.code);

	try {
		const tokenRequest = await fetch(tokenUrl, { // request to get auth token
			method: 'POST', 
			headers: { 'Accept': 'application/json' }, 
			body: params
		});

		if (!tokenRequest.ok) {
			res.status(500).send('Oopsie Poopsie, something went wrong! x_X' + tokenRequest.url + await tokenRequest.text());
			return;
		}

		const {access_token} = await tokenRequest.json();
		const {login, id} = await GitUtils.getGitHubProifle(access_token);

		const users = db.get('users');
		const user = await users.findOneAndUpdate({github_id: id}, {$set: {access_token}}, {upsert: true});
		// Create a repo if the user doesn't already have one.
		const repoReq = await fetch(`https://api.github.com/repos/${login}/contribeautiful_data`);
		if(repoReq.status == 404) { // check if the repo exists
			try {
				await fetch('https://api.github.com/user/repos', {
					method: 'POST',
					headers: {'Authorization': `token ${access_token}`},
					body: JSON.stringify({
						name: 'contribeautiful_data',
						description: 'autogenerated by [Contribeautiful](https://sethpainter.com/contribeautiful)',
						homepage: 'https://sethpainter.com/contribeautiful',
						has_issues: false,
						has_projects: false,
						has_wiki: false,
						has_downloads: false,
						auto_init: true
					})
				});
				await GitUtils.cloneRepo(login, access_token, user._id);
			} catch(e) {
				res.status(500).send('Failed to create repo');
				return;
			}
		} else if(repoReq.ok && !existsSync(`repos/${user._id}`)) {
			res.redirect(`${clientUrl}?error&username=${login}`);
			return;
		}

		res.redirect(`${clientUrl}?id=${user._id}`);
		db.close();
	} catch(error) {
		res.redirect(`${clientUrl}?error=Failed to authenticate with github ${error}`);
	}
});

module.exports = router;