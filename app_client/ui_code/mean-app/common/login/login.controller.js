(function() {

  /**
   * @ngdoc controller
   * @name loginCtrl
   * @description controller for login page
   * @ngInject
   */
  function loginCtrl($location, authentication, $stateParams) {
    var vm = this;

    vm.pageHeader = {
      title: 'Sign in'
    };

    vm.credentials = {
      email: "",
      password: ""
    };

    vm.returnPage = $stateParams.page || '/';

    vm.onSubmit = function() {
      vm.formError = "";
      if (!vm.credentials.email || !vm.credentials.password) {
        vm.formError = "All fields required, please try again";
        return false;
      } else {
        vm.doLogin();
      }
    };

    vm.doLogin = function() {
      vm.formError = "";
      authentication
        .login(vm.credentials)
        .error(function(err) {
          vm.formError = err;
        })
        .then(function() {
          // $location.search('page', null);
          $location.path(vm.returnPage);
        });
    };

  }

  angular
    .module('meanApp')
    .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$location', 'authentication', '$stateParams'];

})();
