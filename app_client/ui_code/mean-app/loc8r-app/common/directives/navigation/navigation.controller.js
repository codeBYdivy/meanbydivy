(function() {

  angular
    .module('loc8rApp')
    .controller('navigationCtrl', navigationCtrl);

  navigationCtrl.$inject = ['$location', 'authentication', '$state'];

  function navigationCtrl($location, authentication, $state) {
    var vm = this;

    vm.currentPath = $location.path();

    vm.isLoggedIn = authentication.isLoggedIn();

    vm.currentUser = authentication.currentUser();

    vm.logout = function() {
      authentication.logout();
      $location.path('/');
      $state.reload();
    };

  }
})();
