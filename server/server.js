const express = require('express');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const app = express();
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '../dist')));

const tokenUrl = 'https://github.com/login/oauth/access_token';

app.get('/authenticate', async(req, res) => {
	if(!req.query?.code) {
		res.send('No code :(');
		return;
	}
	const params = new URLSearchParams();
	params.append('client_id', process.env.VUE_APP_GH_CLIENT_ID);
	params.append('client_secret', process.env.GH_CLIENT_SECRET);
	params.append('code', req.query.code);
	console.log(params)
	const tokenRequest = await fetch(tokenUrl, { method: 'POST', body: params});
	res.send(await tokenRequest.text());
});

app.listen(3500);