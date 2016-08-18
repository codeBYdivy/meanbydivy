var debug = require('debug')('app:loc8r:controllers:locations ' + process.pid);

var primaryConnection = require('../../config/db').primaryConnection;
var appUtils = require('../../utils/appUtils');
var Loc = primaryConnection.model('Location');

var theEarth = (function() {
    var earthRadius = 6378.1; // km, miles is 3959

    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    };
})();

/* GET list of locations */
module.exports.locationsListByDistance = function(req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance * 1000);
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };
    var geoOptions = {
        spherical: true,
        maxDistance: maxDistance,
        // maxDistance: theEarth.getRadsFromDistance(maxDistance),
        num: 10
    };
    if ((!lng && lng !== 0) || (!lat && lat !== 0) || !maxDistance) {
        debug('locationsListByDistance missing params');
        appUtils.errorHandler(res, "invalid_request", "lng, lat and maxDistance query parameters are all required", 400);
        return;
    }
    Loc.geoNear(point, geoOptions, function(err, results, stats) {
        var locations;
        debug('Geo Results', results);
        debug('Geo stats', stats);
        if (err) {
            debug('geoNear error:', err);
            appUtils.errorHandler(res, err.message, "Failed to get locations");
        } else {
            locations = buildLocationList(req, res, results, stats);
            appUtils.successHandler(res, 200, locations);
        }
    });
};

var buildLocationList = function(req, res, results, stats) {
    var locations = [];
    results.forEach(function(doc) {
        locations.push({
            distance: doc.dis,
            // distance: theEarth.getDistanceFromRads(doc.dis),
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id
        });
    });
    return locations;
};

/* GET a location by the id */
module.exports.locationsReadOne = function(req, res) {
    debug('Finding location details', req.params);
    if (req.params && req.params.locationid) {
        Loc
            .findById(req.params.locationid)
            .exec(function(err, location) {
                if (!location) {
                    appUtils.errorHandler(res, err.message, "locationid not found", 404);
                    return;
                } else if (err) {
                    debug(err);
                    appUtils.errorHandler(res, err.message, "error while finding location");
                    return;
                }
                debug(location);
                appUtils.successHandler(res, 200, location);
            });
    } else {
        debug('No locationid specified');
        appUtils.errorHandler(res, "invalid_request", "No locationid in request", 400);
    }
};

/* POST a new location */
/* /api/locations */
module.exports.locationsCreate = function(req, res) {

    if (!req.body.coords || !(req.body.coords.lng || req.body.coords.lat)) {
        appUtils.errorHandler(res, 'Invalid user input', 'Must provide a latitude and longitude for co-ordinates', 400);
        return;
    }

    req.body.coords = [req.body.coords.lng, req.body.coords.lat];

    debug("creating a new location");
    var newLocation = new Loc(req.body);

    newLocation.save(function(err, location) {
        if (err) {
            debug(err);
            appUtils.errorHandler(res, err.message, 'failed to save a location');
        } else {
            debug("created locaion " + location._id);
            appUtils.successHandler(res, 201, location);
        }
    });
};

/* PUT /api/locations/:locationid */
module.exports.locationsUpdateOne = function(req, res) {
    if (!req.params.locationid) {
        appUtils.errorHandler(res, err.message, "Not found, locationid is required", 400);
        return;
    }
    Loc
        .findById(req.params.locationid)
        .select('-reviews -rating')
        .exec(
            function(err, location) {
                if (!location) {
                    appUtils.errorHandler(res, err.message, "locationid not found", 404);
                    return;
                } else if (err) {
                    appUtils.errorHandler(res, err.message, "error while getting location");
                    return;
                }
                location.name = req.body.name;
                location.address = req.body.address;
                location.facilities = req.body.facilities.split(",");
                location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
                location.openingTimes = [{
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1,
                }, {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2,
                }];
                location.save(function(err, location) {
                    if (err) {
                        appUtils.errorHandler(res, err.message, "failed to update location");
                    } else {
                        appUtils.successHandler(res, 200, location);
                    }
                });
            }
        );
};

/* DELETE /api/locations/:locationid */
module.exports.locationsDeleteOne = function(req, res) {
    var locationid = req.params.locationid;
    if (locationid) {
        Loc
            .findByIdAndRemove(locationid)
            .exec(
                function(err, location) {
                    if (err) {
                        debug(err);
                        appUtils.errorHandler(res, err.message, "failed to delete location");
                        return;
                    }
                    debug("Location id " + locationid + " deleted");
                    appUtils.successHandler(res, 204, null);
                }
            );
    } else {
        appUtils.errorHandler(res, "invalid_request", "No locationid", 400);
    }
};
