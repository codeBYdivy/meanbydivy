(function() {

  /**
   * @ngdoc directive
   * @name ratingStars
   * @description directive for ratingStars
   * @ngInject
   */
  function ratingStars(LOC8R_CONSTANTS) {
    return {
      restrict: 'EA',
      scope: {
        thisRating: '=rating'
      },
      templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rRatingStarsTemplate
    };
  }

  ratingStars.$inject = ['LOC8R_CONSTANTS'];

  angular
    .module('loc8rApp')
    .directive('ratingStars', ratingStars);

})();
