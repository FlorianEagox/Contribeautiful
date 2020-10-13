const express = require('express');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const db = require('monk')('mongodb://localhost/contribeautiful');


const router = express.Router();
const tokenUrl = 'https://github.com/login/oauth/access_token';

router.get('/', async(req, res) => {
	if(!req.query?.code) {
		res.send('No code :(');
		return;
	}
	const params = new URLSearchParams();
	params.append('client_id', process.env.VUE_APP_GH_CLIENT_ID);
	params.append('client_secret', process.env.GH_CLIENT_SECRET);
	params.append('code', req.query.code);
	const tokenRequest = await fetch(tokenUrl, {
		method: 'POST', 
		headers: { 'Accept': 'application/json' }, 
		body: params
	});
	if (tokenRequest.ok) {
		const token = await tokenRequest.json();
		const access_token = token.access_token;
		
		const userRequest = await fetch('https://api.github.com/user', {headers: {'Authorization': `token ${access_token}`}});
		const userData = await userRequest.json();

		const users = db.get('users');
		
		// const user = await users.insert({_id: userData.id, access_token});
		const user = await users.findOneAndUpdate({_id: userData.id}, {$set: {access_token}}, {upsert: true});
		res.redirect(`/?user=${user._id}`);
		db.close();
	}
	
});

module.exports = router;