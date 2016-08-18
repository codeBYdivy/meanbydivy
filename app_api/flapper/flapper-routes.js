/**
 * @module      :: flapperRouter
 * @description :: sepearte REST end poits
 * @path        :: /app_api/flapper/flapper-routes.js
 */

var redisMiddleware = require('../utils/middleware/redis').middleware;

var flapperRouter = require('express').Router();
var postsCtrl = require('./controllers/posts');
var commentsCtrl = require('./controllers/comments');

//param auto loads an object rather than reloading it every time
flapperRouter.param('post', postsCtrl.getParamPost);

//for comment upvotes, I also need a comment param
flapperRouter.param('comment', commentsCtrl.getParamComment);

//posts routes
flapperRouter.route("/posts")
    .get(postsCtrl.getAllPosts)
    .post(redisMiddleware, postsCtrl.createPost);

flapperRouter.route("/posts/:post")
    .get(postsCtrl.getSinglePost);

flapperRouter.route("/posts/:post/upvote")
    .put(redisMiddleware, postsCtrl.likePost);

flapperRouter.route("/posts/:post/downvote")
    .put(redisMiddleware, postsCtrl.unlikePost);

//comments routes
flapperRouter.route("/posts/:post/comments")
    .get(commentsCtrl.getAllComments)
    .post(redisMiddleware, commentsCtrl.createComment);

flapperRouter.route("posts/:post/comments/:comment/upvote")
    .put(redisMiddleware, commentsCtrl.likeComment)

flapperRouter.route("posts/:post/comments/:comment/downvote")
    .put(redisMiddleware, commentsCtrl.unlikeComment);

module.exports = flapperRouter;
