/**
 * @module      :: comments
 * @description :: Controller for comments
 * @path        :: /app_api/flapper/controllers/comments.js
 */

var debug = require('debug')('app:flapper:controllers:comments ' + process.pid);
var primaryConnection = require('../../config/db').primaryConnection;
var appUtils = require('../../utils/appUtils');
var Comment = primaryConnection.model('Comment');

module.exports.getParamComment = function(req, res, next, id) {
    var query = Comment.findById(id);
    query.exec(function(err, comment) {
        if (err) {
            return next(err);
        }
        if (!comment) {
            return next(new Error("Cannot find comment!"));
        }
        req.comment = comment;
        return next();
    });
};

module.exports.getAllComments = function(req, res) {
    appUtils.successHandler(res, 200, req.post.comments);
};

module.exports.createComment = function(req, res) {
    var comment = new Comment(req.body);
    comment.post = req.post;
    comment.author = req.payload.username;
    comment.save(function(err, comment) {
        if (err) {
            appUtils.errorHandler(res, err.message, "failed to save comment", 400);
        }
        //no http errors, add this comment to the comments array
        req.post.comments.push(comment);

        req.post.save(function(err, post) {
            if (err) {
                appUtils.errorHandler(res, err.message, "failed to save post", 400);
            }
            appUtils.successHandler(res, 200, comment);
        });
    });
};

module.exports.likeComment = function(req, res) {
    req.comment.upvote(function(err, comment) {
        if (err) {
            appUtils.errorHandler(res, err.message, "error while saving like comment", 400);
        }
        appUtils.successHandler(res, 200, comment);
    });
};

module.exports.unlikeComment = function(req, res) {
    req.comment.downvote(function(err, comment) {
        if (err) {
            appUtils.errorHandler(res, err.message, "error while saving unlike comment", 400);
        }
        appUtils.successHandler(res, 200, comment);
    });
};
