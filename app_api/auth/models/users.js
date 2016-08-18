var mongoose = require('mongoose');
var crypto = require('crypto');
var primaryConnection = require('../../config/db').primaryConnection;
var redisImpl = require('../../utils/middleware/redis');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hash: String,
    salt: String
});

userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function(req, res, next) {
    return redisImpl.createToken({
        _id: this._id,
        username: this.username,
        access: this.access,
        name: this.name,
        email: this.email
    }, req, res, next);
};

// module.exports = primaryConnection.model('User', userSchema);
primaryConnection.model('User', userSchema);
