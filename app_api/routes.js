/**
 * @module      :: mainRouter
 * @description :: sepearte REST end points
 * @path        :: /app_api/routes.js
 */

var redisMiddleware = require('./utils/middleware/redis').middleware;

module.exports = function(mainRouter) {
    require('./auth/auth-routes')(mainRouter);
    mainRouter.use('/loc8r', require('./loc8r/loc8r-routes'));
    // mainRouter.use('/loc8r', redisMiddleware, require('./loc8r/loc8r-routes'));
    mainRouter.use('/flapper', require('./flapper/flapper-routes'));
    mainRouter.use('/contacts', require('./contacts/contacts-routes'));
    mainRouter.get('/react', require('./react-app/react-routes'));
}
