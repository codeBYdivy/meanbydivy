/**
 * @module      :: ReactRouter
 * @description :: sepearte REST end poits
 * @path        :: /app_api/react/react-routes.js
 */

var ReactRouter = require('express').Router();

ReactRouter.get('/dashboard', function(request, response) {
    response.sendFile(require('path').normalize(__dirname + '/dashboard.json'));
});

module.exports = ReactRouter;
