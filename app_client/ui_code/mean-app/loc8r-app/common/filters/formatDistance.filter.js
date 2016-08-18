(function() {


    var _isNumeric = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    /**
     * @ngdoc filter
     * @name formatDistance
     * @description filter for formatting Distance
     */

    function formatDistance() {
        return function(distance) {
            var numDistance, unit;
            if (distance && _isNumeric(distance)) {
                if (distance > 1000) {
                    numDistance = parseFloat(distance / 1000).toFixed(2);
                    unit = ' km';
                } else {
                    numDistance = parseInt(distance);
                    unit = ' m';
                }
                return numDistance + unit;
            } else {
                return "?";
            }
        };
    }

    angular
        .module('loc8rApp')
        .filter('formatDistance', formatDistance);

})();
