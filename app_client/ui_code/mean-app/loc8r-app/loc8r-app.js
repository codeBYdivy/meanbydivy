(function() {
    'use strict';

    /**
     * @ngdoc config
     * @description routes config for loc8rApp
     */
    angular
        .module('meanApp')
        .config(['$stateProvider', '$urlRouterProvider', 'LOC8R_CONSTANTS',
            function loc8rConfig($stateProvider, $urlRouterProvider, LOC8R_CONSTANTS) {

                $urlRouterProvider.when('/loc8r', '/loc8r/home');

                $stateProvider.state('loc8r', {
                    url: '/loc8r',
                    templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rIndexTemplate
                })

                .state('loc8r.home', {
                    url: '/home',
                    templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rHomeTemplate,
                    controller: 'homeCtrl',
                    controllerAs: 'vm'
                })

                .state('loc8r.about', {
                    url: '/about',
                    templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rAboutTemplate,
                    controller: 'aboutCtrl',
                    controllerAs: 'vm'
                })

                .state('loc8r.location', {
                    url: '/location/:locationid',
                    templateUrl: LOC8R_CONSTANTS.loc8rViews.loc8rLocationDetailTemplate,
                    controller: 'locationDetailCtrl',
                    controllerAs: 'vm'
                });

            }
        ]);

})();

(function() {
    'use strict';

    angular.module('loc8rApp', []);

    /**
     * @ngdoc constant
     * @name LOC8R_CONSTANTS
     * @description constants used across loc8r app
     */
    angular
        .module('loc8rApp')
        .constant('LOC8R_CONSTANTS', {
            loc8rViews: {
                loc8rIndexTemplate: 'mean-app/loc8r-app/loc8r-index.html',
                loc8rHomeTemplate: 'mean-app/loc8r-app/home/home.view.html',
                loc8rAboutTemplate: 'mean-app/loc8r-app/about/about.view.html',
                loc8rLocationDetailTemplate: 'mean-app/loc8r-app/locationDetail/locationDetail.view.html',
                loc8rFooterGenericTemplate: 'mean-app/loc8r-app/common/directives/footerGeneric/footerGeneric.template.html',
                loc8rNavigationTemplate: 'mean-app/loc8r-app/common/directives/navigation/navigation.template.html',
                loc8rHeaderTemplate: 'mean-app/loc8r-app/common/directives/pageHeader/pageHeader.template.html',
                loc8rRatingStarsTemplate: 'mean-app/loc8r-app/common/directives/ratingStars/ratingStars.template.html'
            }
        });

})();
