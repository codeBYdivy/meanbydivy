(function() {

    /**
     * @ngdoc controller
     * @name homeCtrl
     * @description controller for home page
     * @ngInject
     */
    function homeCtrl($scope, loc8rData, geolocation, $uibModal) {
        var vm = this;
        vm.pageHeader = {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        };
        vm.sidebar = {
            content: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for."
        };
        vm.message = "Checking your location";
        vm.proximity = 5;
        vm.position = {};

        vm.getData = function(position) {
            vm.position = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            vm.message = "Searching for nearby places within " + vm.proximity + " kilometres";
            loc8rData.locationByCoords(vm.position.lat, vm.position.lng, vm.proximity)
                .success(function(data) {
                    vm.message = data.length > 0 ? "" : "No locations found nearby";
                    vm.data = { locations: data };
                })
                .error(function(e) {
                    vm.message = "Sorry, something's gone wrong, please try again later";
                });
        };

        vm.showError = function(error) {
            $scope.$apply(function() {
                vm.message = error.message;
            });
        };

        vm.noGeo = function() {
            $scope.$apply(function() {
                vm.message = "Geolocation is not supported by this browser.";
            });
        };

        vm.loadLocations = function() {
            geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
        };

        vm.addNewLocationForm = function() {
            $uibModal.open({
                templateUrl: 'addNewLocationModal',
                controller: 'addNewLocationModalCtrl as vm',
                size: 'lg',
                backdrop: 'static',
                windowClass: 'add-location-modal',
                resolve: {
                    currentCoordinates: function() {
                        return {
                            latitude: vm.position.lat,
                            longitude: vm.position.lng
                        };
                    }
                }
            }).result.then(function(data) {
                vm.data.locations.push(data);
                vm.loadLocations();
            });
        };

        geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);

    }

    homeCtrl.$inject = ['$scope', 'loc8rData', 'geolocation', '$uibModal'];

    angular
        .module('loc8rApp')
        .controller('homeCtrl', homeCtrl);


})();

(function() {


    /**
     * @ngdoc controller
     * @name addNewLocationModalCtrl
     * @description controller for add location modal popup
     */
    angular.module('loc8rApp')

    .controller('addNewLocationModalCtrl', ['$uibModalInstance', '$filter', '$locale', '$scope', 'currentCoordinates', 'loc8rData',
        function($uibModalInstance, $filter, $locale, $scope, currentCoordinates, loc8rData) {
            console.log(currentCoordinates);
            var vm = this;
            vm.map = { center: currentCoordinates, zoom: 17 };
            vm.marker = {
                id: 0,
                coords: currentCoordinates,
                options: {
                    draggable: true,
                    labelAnchor: "100 0",
                    labelClass: "marker-labels"
                }
            };
            vm.modal = {
                close: function(result) {
                    $uibModalInstance.close(result);
                },
                cancel: function() {
                    $uibModalInstance.dismiss('cancel');
                }
            };
            vm.ALL_FACILITIES = [];
            vm.WEEKDAYS = $locale.DATETIME_FORMATS.DAY;
            vm.WEEKDAYS.unshift('Monday - Friday');
            vm.WEEKDAYS = vm.WEEKDAYS.map(function(val) {
                return { days: val, opening: '', closing: '', closed: true };
            });
            vm.newLocation = {
                coords: vm.marker.coords,
                openingTimes: []
            };
            vm.tagTransform = function(newTag) {
                return {
                    days: newTag,
                    opening: '',
                    closing: '',
                    closed: true
                };
            };
            vm.editTiming = function(day) {
                vm.editDay = day;
            };

            $scope.$watchCollection(function() {
                return vm.newLocation.openingTimes;
            }, function(newCollection, oldCollection, scope) {
                if (!newCollection.length) {
                    vm.editDay = {};
                } else {
                    vm.editDay = newCollection[newCollection.length - 1];
                }
            });

            vm.addLocation = function() {
                vm.formError = "";
                if (vm.addLocationForm.$invalid) {
                    return;
                }
                var createLocationObj = angular.copy(vm.newLocation);
                createLocationObj.coords = {
                    lat: createLocationObj.coords.latitude,
                    lng: createLocationObj.coords.longitude
                };
                createLocationObj.openingTimes = createLocationObj.openingTimes.map(function(obj) {
                    return obj.closed ? { days: obj.days, closed: obj.closed } : {
                        days: obj.days,
                        opening: $filter('date')(obj.opening, 'shortTime'),
                        closing: $filter('date')(obj.closing, 'shortTime'),
                        closed: obj.closed
                    };
                });

                loc8rData.createLocation(createLocationObj)
                    .success(function(data) {
                        vm.modal.close(data);
                    })
                    .error(function(data) {
                        vm.formError = "Your location has not been saved, please try again";
                    });
            };

        }
    ]);

})();
