(function() {

    /**
     * @ngdoc service
     * @name loc8rData
     * @description service for location based data
     * @ngInject
     */
    function loc8rData($http, authentication) {
        var locationByCoordsFn = function(lat, lng, proximity) {
            return $http.get('/api/loc8r/locations', {
                params: {
                    lat: lat,
                    lng: lng,
                    maxDistance: proximity || 10
                },
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            });
        };

        var locationByIdFn = function(locationid) {
            return $http.get('/api/loc8r/locations/' + locationid, {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            });
        };

        var addReviewByIdFn = function(locationid, data) {
            return $http.post('/api/loc8r/locations/' + locationid + '/reviews', data, {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            });
        };

        var createLocationFn = function(createObj) {
            return $http({
                method: 'POST',
                url: '/api/loc8r/locations',
                data: createObj,
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            });
        };

        return {
            createLocation: createLocationFn,
            locationByCoords: locationByCoordsFn,
            locationById: locationByIdFn,
            addReviewById: addReviewByIdFn
        };
    }

    loc8rData.$inject = ['$http', 'authentication'];

    angular
        .module('loc8rApp')
        .service('loc8rData', loc8rData);

})();
