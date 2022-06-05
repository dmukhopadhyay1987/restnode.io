var express = require('express');
var app = express();
const path = require('path');
var rofl = require('./log/file_logger');
var bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb', parameterLimit: 50000, arrayLimit: 5000 }));

var authHandler = require('./auth/tokencreation');
var main_controller = require('./main/maincontroller');

app.post('/restnode.io/auth', authHandler.token);
app.use(authHandler.validateToken);
app.use('/restnode.io/', main_controller);
app.use('/static', express.static(path.join(__dirname, 'view')))

process.on('uncaughtException', (err, origin) => {
    rofl.fatal('', {}, 'Exception Occurred. Keeping Alive.', err);
});

module.exports = app;
