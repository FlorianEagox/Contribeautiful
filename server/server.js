const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/authenticate', (req, res) => {
	console.log(req);
	res.send('hi');
});

app.listen(3500);