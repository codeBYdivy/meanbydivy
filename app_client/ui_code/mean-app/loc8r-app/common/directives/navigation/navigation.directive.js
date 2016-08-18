(function() {

  /**
   * @ngdoc directive
   * @name navigation
   * @description directive for navigation items
   * @ngInject
   */
  function navigation(LOC8R_CONSTANTS) {
    return {
      restrict: 'EA',
      templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rNavigationTemplate,
      controller: 'navigationCtrl as navvm'
    };
  }

  navigation.$inject = ['LOC8R_CONSTANTS'];

  angular
    .module('loc8rApp')
    .directive('navigation', navigation);

})();
