var jwt = require('express-jwt');
var redisMiddleware = require('../utils/middleware/redis').middleware;
var jwtAuthMiddleWare = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});

var loc8rRouter = require('express').Router();
var locationsCtrl = require('./controllers/locations');
var reviewsCtrl = require('./controllers/reviews');

//locations routes
loc8rRouter.route("/locations")
    .get(locationsCtrl.locationsListByDistance)
    .post(locationsCtrl.locationsCreate);

loc8rRouter.route("/locations/:locationid")
    .get(locationsCtrl.locationsReadOne)
    .put(locationsCtrl.locationsUpdateOne)
    .delete(locationsCtrl.locationsDeleteOne);

//reviews routes
loc8rRouter.route("/locations/:locationid/reviews")
    .post(jwtAuthMiddleWare, reviewsCtrl.reviewsCreate);

loc8rRouter.route("locations/:locationid/reviews/:reviewid")
    .get(reviewsCtrl.reviewsReadOne)
    .put(jwtAuthMiddleWare, reviewsCtrl.reviewsUpdateOne)
    .delete(jwtAuthMiddleWare, reviewsCtrl.reviewsDeleteOne);

module.exports = loc8rRouter;
