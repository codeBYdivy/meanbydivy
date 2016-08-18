(function() {

    /**
     * @ngdoc service
     * @name authentication
     * @description service for authentication
     * @ngInject
     */
    angular.module('meanApp').service('authentication', ['$http', '$window',
        function($http, $window) {

            var saveToken = function(token) {
                $window.localStorage['mean-app-token'] = token;
            };

            var getToken = function() {
                return $window.localStorage['mean-app-token'];
            };

            var isLoggedIn = function() {
                var token = getToken();

                if (token) {
                    var payload = JSON.parse($window.atob(token.split('.')[1]));
                    return true;
                    // return payload.exp > Date.now() / 1000;
                } else {
                    return false;
                }
            };

            var currentUser = function() {
                if (isLoggedIn()) {
                    var token = getToken();
                    var payload = JSON.parse($window.atob(token.split('.')[1]));
                    return {
                        email: payload.email,
                        name: payload.name
                    };
                }
            };

            var register = function(user) {
                return $http.post('/api/register', user).success(function(data) {
                    saveToken(data.token);
                });
            };

            var login = function(user) {
                return $http.post('/api/login', user).success(function(data) {
                    saveToken(data.token);
                });
            };

            var logout = function() {
                $window.localStorage.removeItem('mean-app-token');
            };

            return {
                currentUser: currentUser,
                saveToken: saveToken,
                getToken: getToken,
                isLoggedIn: isLoggedIn,
                register: register,
                login: login,
                logout: logout
            };
        }
    ]);


})();
