/**
 * @module      :: posts
 * @description :: Controller for posts
 * @path        :: /app_api/flapper/controllers/posts.js
 */
var debug = require('debug')('app:flapper:controllers:posts ' + process.pid);

var primaryConnection = require('../../config/db').primaryConnection;
var appUtils = require('../../utils/appUtils');
var Post = primaryConnection.model('Post');

module.exports.getParamPost = function(req, res, next, id) {
    var query = Post.findById(id);
    query.exec(function(err, post) {
        //first throw an error if found through http
        if (err) {
            return next(err);
        }
        //again throw and error if the post does not exist for this id
        if (!post) {
            return next(new Error("Cannot find post!"));
        }
        //if no errors, toss post to the request object to use later
        req.post = post;
        return next();
    });
};

module.exports.getAllPosts = function(req, res) {
    Post.find(function(err, posts) {
        if (err) {
            appUtils.errorHandler(res, err.message, "failed to retrive posts", 400);
        }
        appUtils.successHandler(res, 200, posts);
    });
};

module.exports.createPost = function(req, res) {
    //post is going to be created with the Post mongoose model
    //this creates a new object in memory before saving it
    debug("creating post");
    var post = new Post(req.body);
    post.author = req.user.name;

    post.save(function(err, post) {
        if (err) {
            appUtils.errorHandler(res, err.message, "failed to save posts", 400);
        } else {
            debug(post);
            appUtils.successHandler(res, 201, post);
        }
    });
};

module.exports.getSinglePost = function(req, res) {
    //using the populate() method, all of the comments associated with this post
    //are loaded
    req.post.populate('comments', function(err, post) {
        //the post object will be retrieved and added to the req object by
        //the param middleware, so we just have to send the
        //json back to the client
        appUtils.successHandler(res, 200, req.post);
    });
};


module.exports.likePost = function(req, res) {
    req.post.upvote(function(err, post) {
        if (err) {
            appUtils.errorHandler(res, err.message, "error while saving like post", 400);
        }
        appUtils.successHandler(res, 200, post);
    });
};

module.exports.unlikePost = function(req, res) {
    debug('downvote');
    req.post.downvote(function(err, post) {
        if (err) {
            appUtils.errorHandler(res, err.message, "error while saving unlike post", 400);
        }
        appUtils.successHandler(res, 200, post);
    });
};
