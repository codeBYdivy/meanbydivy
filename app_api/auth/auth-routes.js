var authCtrl = require('./controllers/authentication');

module.exports = function(authRoutes) {

    // authentication
    authRoutes.post('/register', authCtrl.register);
    authRoutes.post('/login', authCtrl.login);

}
