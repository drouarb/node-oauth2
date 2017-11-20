/**
 * Created by drouar_b on 29/09/2017.
 */

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

module.exports = app;