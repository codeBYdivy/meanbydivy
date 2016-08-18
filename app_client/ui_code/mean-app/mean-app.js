(function() {
    'use strict';
    angular
        .module('meanApp', ['ngMessages', 'ngSanitize', 'ngAnimate', 'ngTouch', 'ui.router', 'ui.bootstrap', 'ui.select', 'uiGmapgoogle-maps',
            'contactsApp', 'flapperApp', 'loc8rApp'
        ])
        .constant('MEANAPP_CONSTANTS', {
            templateUrls: {
                landingPagetemplate: 'mean-app/common/landing-page.view.html',
                registerTemplate: 'mean-app/common/register/register.view.html',
                loginTemplate: 'mean-app/common/login/login.view.html'
            }
        })
        /*.config(['uiGmapGoogleMapApiProvider',
            function(uiGmapGoogleMapApiProvider) {
                uiGmapGoogleMapApiProvider.configure({
                    key: 'AIzaSyCjnEfY5rsafIxzOCzoslnkww-2gMeaizI',
                    v: '3.X',
                    libraries: 'weather,geometry,visualization'
                });
            }
        ])*/;

    /**
     * @ngdoc config
     * @description Routes for meanApp
     */
    angular
        .module('meanApp')
        .config(['$stateProvider', '$urlRouterProvider', 'MEANAPP_CONSTANTS',
            function($stateProvider, $urlRouterProvider, MEANAPP_CONSTANTS) {
                $urlRouterProvider.otherwise('/');

                $stateProvider.state('register', {
                    url: '/register',
                    templateUrl: MEANAPP_CONSTANTS.templateUrls.registerTemplate,
                    controller: 'registerCtrl',
                    controllerAs: 'vm'
                })

                .state('login', {
                    url: '/login',
                    templateUrl: MEANAPP_CONSTANTS.templateUrls.loginTemplate,
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                })

                .state('home', {
                    url: '/',
                    templateUrl: MEANAPP_CONSTANTS.templateUrls.landingPagetemplate
                });
            }
        ]);

})();
