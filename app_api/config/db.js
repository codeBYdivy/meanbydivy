var debug = require('debug')('app:db: ' + process.pid);
var mongoose = require('mongoose');
var readLine = require('readline');
var Q = require('q');
var redis = require('redis');
var gracefulShutdown;

if (process.platform === 'win32') {
    var r1 = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r1.on('SIGINT', function() {
        process.emit('SIGINT');
    });
}

var redisConnection;
var redisConnURI;
if (process.env.NODE_ENV === 'production') {
    redisConnURI = process.env.AWS_REDIS_CONN_URI;
    var rtg = require('url').parse(redisConnURI);
    redisConnection = redis.createClient(rtg.port, rtg.hostname, { no_ready_check: true });
    redisConnection.auth(rtg.auth.split(':')[1]);
} else {
    redisConnURI = 'redis://localhost:6379';
    redisConnection = redis.createClient();
}


redisConnection.on('error', function(err) {
    debug('Redis connection error');
});

redisConnection.on('connect', function() {
    debug('Redis successfully connected to ' + redisConnURI);
});

mongoose.set('debug', process.env.NODE_ENV !== 'production');
mongoose.Promise = global.Promise;

var primaryConnMongoURI = process.env.NODE_ENV === 'production' ? process.env.MONGOLAB_PRIMARY_CONN_URI : process.env.LOCAL_MONGO_PRIMARY_CONN_URI;
var primaryConnection = mongoose.createConnection(primaryConnMongoURI, { auth: { authMechanism: process.env.MONGO_AUTH_MECHANISM } });

// PRIMARY CONNECTION EVENTS
primaryConnection.on('connected', function() {
    debug('Mongoose primaryConnection connected to ' + primaryConnMongoURI);
});
primaryConnection.on('error', function(err) {
    debug('Mongoose primaryConnection error: ' + err);
});
primaryConnection.on('disconnected', function() {
    debug('Mongoose primaryConnection disconnected');
});



var secondaryConnMongoURI = process.env.NODE_ENV === 'production' ? process.env.MONGOLAB_SECONDARY_CONN_URI : process.env.LOCAL_MONGO_SECONDARY_CONN_URI;
var secondaryConnection = mongoose.createConnection(secondaryConnMongoURI, { auth: { authMechanism: process.env.MONGO_AUTH_MECHANISM } });

// SECONDARY CONNECTION EVENTS
secondaryConnection.on('connected', function() {
    debug('Mongoose secondaryConnection connected to ' + secondaryConnMongoURI);
});
secondaryConnection.on('error', function(err) {
    debug('Mongoose secondaryConnection error: ' + err);
});
secondaryConnection.on('disconnected', function() {
    debug('Mongoose secondaryConnection disconnected');
});


module.exports = {
    primaryConnection: primaryConnection,
    secondaryConnection: secondaryConnection,
    redisConnection: redisConnection
};


// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    Q.all([
        primaryConnection.close(),
        secondaryConnection.close()
    ]).then(function() {
        debug('All the Mongoose connections disconnected through ' + msg);
        redisConnection.quit(function() {
            debug('Redis successfully disconnected through ' + msg);
            callback();
        });
        // callback();
    });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        process.exit(0);
    });
});

// BRING IN YOUR SCHEMAS & MODELS
require('../auth/models/users');
require('../contacts/models/contacts');
require('../flapper/models/comments');
require('../flapper/models/posts');
require('../loc8r/models/locations');

debug('Registering database configurations');
