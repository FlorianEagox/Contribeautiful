const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(require('morgan')('dev'));
app.use(require('cors')());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/authenticate', require('./routes/authenticate'));
app.use('/user', require('./routes/user'));
app.use('/graph', require('./routes/graph'));

app.get('/test', (req, res) => {
	let num = 0;
	let interval = setInterval(() => res.write(num++ + ' '), 300);
	res.setHeader('Content-Type', 'text/html');
	setTimeout(() => {
		clearInterval(interval);
		res.send();
	}, 5000);
});

const listener = app.listen(3500, () => {
	console.log(`Listening on ${listener.address().port}`);
});