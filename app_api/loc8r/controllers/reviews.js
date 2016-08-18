var primaryConnection = require('../../config/db').primaryConnection;
var appUtils = require('../../utils/appUtils');
var Loc = primaryConnection.model('Location');
var User = primaryConnection.model('User');

/* POST a new review, providing a locationid */
/* /api/locations/:locationid/reviews */
module.exports.reviewsCreate = function(req, res) {
    console.log("Reviewing");
    getAuthor(req, res, function(req, res, userName) {
        if (req.params.locationid) {
            Loc
                .findById(req.params.locationid)
                .select('reviews')
                .exec(
                    function(err, location) {
                        if (err) {
                            appUtils.errorHandler(res, err.message, "error while creating a review", 400);
                        } else {
                            doAddReview(req, res, location, userName);
                        }
                    }
                );
        } else {
            appUtils.errorHandler(res, "invalid_request", "Not found, locationid required", 404);
        }
    });
};

var getAuthor = function(req, res, callback) {
    console.log("Finding author with email " + req.payload.email);
    if (req.payload.email) {
        User
            .findOne({ email: req.payload.email })
            .exec(function(err, user) {
                if (!user) {
                    appUtils.errorHandler(res, "no_results", "User not found", 404);
                    return;
                } else if (err) {
                    console.log(err);
                    appUtils.errorHandler(res, err.message, "error while finding user", 404);
                    return;
                }
                console.log(user);
                callback(req, res, user.name);
            });

    } else {
        appUtils.errorHandler(res, "email is required", "User not found", 404);
        return;
    }

};

var doAddReview = function(req, res, location, author) {
    if (!location) {
        appUtils.errorHandler(res, "no_results", "locationid not found", 404);
    } else {
        location.reviews.push({
            author: author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });
        location.save(function(err, location) {
            var thisReview;
            if (err) {
                appUtils.errorHandler(res, err.message, "error while saving review", 400);
            } else {
                updateAverageRating(location._id);
                thisReview = location.reviews[location.reviews.length - 1];
                appUtils.successHandler(res, 201, thisReview);
            }
        });
    }
};

var updateAverageRating = function(locationid) {
    console.log("Update rating average for", locationid);
    Loc
        .findById(locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                if (!err) {
                    doSetAverageRating(location);
                }
            });
};

var doSetAverageRating = function(location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if (location.reviews && location.reviews.length > 0) {
        reviewCount = location.reviews.length;
        ratingTotal = 0;
        for (i = 0; i < reviewCount; i++) {
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Average rating updated to", ratingAverage);
            }
        });
    }
};

module.exports.reviewsUpdateOne = function(req, res) {
    if (!req.params.locationid || !req.params.reviewid) {
        appUtils.errorHandler(res, "invalid_request", "Not found, locationid and reviewid are both required", 404);
        return;
    }
    Loc
        .findById(req.params.locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                var thisReview;
                if (!location) {
                    appUtils.errorHandler(res, "no_results", "locationid not found", 404);
                    return;
                } else if (err) {
                    appUtils.errorHandler(res, err.message, "error while retrieving review", 400);
                    return;
                }
                if (location.reviews && location.reviews.length > 0) {
                    thisReview = location.reviews.id(req.params.reviewid);
                    if (!thisReview) {
                        appUtils.errorHandler(res, "no_results", "reviewid not found", 404);
                    } else {
                        thisReview.author = req.body.author;
                        thisReview.rating = req.body.rating;
                        thisReview.reviewText = req.body.reviewText;
                        location.save(function(err, location) {
                            if (err) {
                                appUtils.errorHandler(res, err.message, "error while saving review", 404);
                            } else {
                                updateAverageRating(location._id);
                                appUtils.successHandler(res, 200, thisReview);
                            }
                        });
                    }
                } else {
                    appUtils.errorHandler(res, {}, "No review to update", 404);
                }
            }
        );
};

module.exports.reviewsReadOne = function(req, res) {
    console.log("Getting single review");
    if (req.params && req.params.locationid && req.params.reviewid) {
        Loc
            .findById(req.params.locationid)
            .select('name reviews')
            .exec(
                function(err, location) {
                    console.log(location);
                    var response, review;
                    if (!location) {
                        appUtils.errorHandler(res, "no_results", "locationid not found", 404);
                        return;
                    } else if (err) {
                        appUtils.errorHandler(res, err.message, "error while retrieving review", 400);
                        return;
                    }
                    if (location.reviews && location.reviews.length > 0) {
                        review = location.reviews.id(req.params.reviewid);
                        if (!review) {
                            appUtils.errorHandler(res, {}, "reviewid not found", 404);
                        } else {
                            response = {
                                location: {
                                    name: location.name,
                                    id: req.params.locationid
                                },
                                review: review
                            };
                            appUtils.successHandler(res, 200, response);
                        }
                    } else {
                        appUtils.errorHandler(res, {}, "No reviews found", 404);
                    }
                }
            );
    } else {
        appUtils.errorHandler(res, "invalid_request", "Not found, locationid and reviewid are both required", 404);
    }
};

// app.delete('/api/locations/:locationid/reviews/:reviewid'
module.exports.reviewsDeleteOne = function(req, res) {
    if (!req.params.locationid || !req.params.reviewid) {
        appUtils.errorHandler(res, "invalid_request", "Not found, locationid and reviewid are both required", 404);
        return;
    }
    Loc
        .findById(req.params.locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                if (!location) {
                    appUtils.errorHandler(res, "no_results", "locationid not found", 404);
                    return;
                } else if (err) {
                    appUtils.errorHandler(res, err.message, "eror while retrieving reviews", 400);
                    return;
                }
                if (location.reviews && location.reviews.length > 0) {
                    if (!location.reviews.id(req.params.reviewid)) {
                        appUtils.errorHandler(res, "no_results", "reviewid not found", 404);
                    } else {
                        location.reviews.id(req.params.reviewid).remove();
                        location.save(function(err) {
                            if (err) {
                                appUtils.errorHandler(res, err.message, "eror while save location in delete review", 404);
                            } else {
                                updateAverageRating(location._id);
                                appUtils.successHandler(res, 204, null);
                            }
                        });
                    }
                } else {
                    appUtils.errorHandler(res, {}, "No review to delete", 404);
                }
            }
        );
};
