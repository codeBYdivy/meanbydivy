require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var router = express.Router();

require('./app_api/config/db');
require('./app_api/utils/middleware/passport');
require('./app_api/utils/middleware/redis');

require('./app_api/routes')(router);

var app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(favicon(__dirname + '/app_client/dist.prod/images/favicon.ico'));
} else {
    app.use(favicon(__dirname + '/app_client/dist.dev/images/favicon.ico'));
}


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'app_client/dist.prod')));
} else {
    app.use(express.static(path.join(__dirname, 'app_client/dist.dev')));
}

app.use('/api', router);


app.use(function(req, res) {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, 'app_client/dist.prod', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'app_client/dist.dev', 'index.html'));
    }
});


// error handler for all the applications
app.use(function(err, req, res, next) {

    var errorType = typeof err,
        code = 500,
        msg = { message: "Internal Server Error" };

    switch (err.name) {
        case "UnauthorizedError":
            code = err.status;
            msg = undefined;
            break;
        case "BadRequestError":
        case "UnauthorizedAccessError":
        case "NotFoundError":
            code = err.status;
            msg = err.inner;
            break;
        default:
            break;
    }

    return res.status(code).json(msg);

});

module.exports = app;
