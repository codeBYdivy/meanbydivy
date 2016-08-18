/**
 * @module      :: Post
 * @description :: mongoose model
 * @path        :: /app_api/flapper/models/posts.js
 */

var mongoose = require('mongoose');
var primaryConnection = require('../../config/db').primaryConnection;

var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    votes: { type: Number, default: 0 },
    author: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(cb) {
    this.votes += 1;
    this.save(cb);
};

PostSchema.methods.downvote = function(cb) {
    this.votes -= 1;
    this.save(cb);
};

primaryConnection.model('Post', PostSchema);
