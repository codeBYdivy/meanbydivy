(function() {

  /**
   * @ngdoc controller
   * @name locationDetailCtrl
   * @description controller for location detail page
   * @ngInject
   */
  function locationDetailCtrl($stateParams, $location, $uibModal, loc8rData, authentication) {
    var vm = this;
    vm.locationid = $stateParams.locationid;

    vm.isLoggedIn = authentication.isLoggedIn();

    vm.currentPath = $location.path();

    loc8rData.locationById(vm.locationid)
      .success(function(data) {
        vm.data = { location: data };
        vm.pageHeader = {
          title: vm.data.location.name
        };
      })
      .error(function(e) {
        console.log(e);
      });

    vm.popupReviewForm = function() {
      var modalInstance = $uibModal.open({
        templateUrl: '/reviewModal/reviewModal.view.html',
        controller: 'reviewModalCtrl as vm',
        resolve: {
          locationData: function() {
            return {
              locationid: vm.locationid,
              locationName: vm.data.location.name
            };
          }
        }
      });

      modalInstance.result.then(function(data) {
        vm.data.location.reviews.push(data);
      });
    };

  }

  angular
    .module('loc8rApp')
    .controller('locationDetailCtrl', locationDetailCtrl);

  locationDetailCtrl.$inject = ['$stateParams', '$location', '$uibModal', 'loc8rData', 'authentication'];

})();
