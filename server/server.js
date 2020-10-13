const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(require('morgan')('dev'));

app.use(express.static(path.join(__dirname, '../dist')));
app.use('/authenticate', require('./routes/authenticate'));


app.listen(3500);