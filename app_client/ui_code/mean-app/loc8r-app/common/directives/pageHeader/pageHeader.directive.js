(function() {

  /**
   * @ngdoc directive
   * @name pageHeader
   * @description directive for pageHeader
   * @ngInject
   */
  function pageHeader(LOC8R_CONSTANTS) {
    return {
      restrict: 'EA',
      scope: {
        content: '=content'
      },
      templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rHeaderTemplate
    };
  }

  pageHeader.$inject = ['LOC8R_CONSTANTS'];

  angular
    .module('loc8rApp')
    .directive('pageHeader', pageHeader);

})();
