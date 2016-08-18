(function() {

  /**
   * @ngdoc directive
   * @name footerGeneric
   * @description directive for common footer
   * @ngInject
   */
  function footerGeneric(LOC8R_CONSTANTS) {
    return {
      restrict: 'EA',
      templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rFooterGenericTemplate
    };
  }

  footerGeneric.$inject = ['LOC8R_CONSTANTS'];

  angular
    .module('loc8rApp')
    .directive('footerGeneric', footerGeneric);

})();
