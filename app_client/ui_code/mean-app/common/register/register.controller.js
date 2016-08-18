(function() {

  /**
   * @ngdoc controller
   * @name registerCtrl
   * @description controller for register page
   * @ngInject
   */
  function registerCtrl($location, authentication, $stateParams) {
    var vm = this;

    vm.pageHeader = {
      title: 'Create a new account'
    };

    vm.credentials = {
      name: "",
      email: "",
      password: ""
    };

    vm.returnPage = $stateParams.page || '/';

    vm.onSubmit = function() {
      vm.formError = "";
      if (!vm.credentials.name || !vm.credentials.email || !vm.credentials.password) {
        vm.formError = "All fields required, please try again";
        return false;
      } else {
        vm.doRegister();
      }
    };

    vm.doRegister = function() {
      vm.formError = "";
      authentication
        .register(vm.credentials)
        .error(function(err) {
          vm.formError = err;
        })
        .then(function() {
          $location.path(vm.returnPage);
        });
    };

  }

  angular
    .module('meanApp')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', '$stateParams'];

})();
