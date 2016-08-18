var debug = require('debug')('app:passport: ' + process.pid);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var primaryConnection = require('../../config/db').primaryConnection;
var User = primaryConnection.model('User');

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(username, password, done) {
        debug('executing passport strategy');
        User.findOne({ email: username }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));

debug('Registering passport LocalStrategy');
