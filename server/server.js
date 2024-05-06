const express = require('express');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '..', '.env')});
process.chdir(path.join(__dirname, '..'))
console.log(process.env.PORT + "ASDF" + __dirname)
const app = express();
app.use(require('morgan')('dev'));
app.use(require('cors')());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/authenticate', require('./routes/authenticate'));
app.use('/user', require('./routes/user'));
app.use('/graph', require('./routes/graph'));

const listener = app.listen(process.env.PORT || 5010, () => {
	console.log(`Listening on ${listener.address().port}`);
});
