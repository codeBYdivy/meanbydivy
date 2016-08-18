(function() {
    'use strict';

    //@ngdoc config
    //@description Routes for flapperApp
    angular
        .module('meanApp')
        .config(['$stateProvider', '$urlRouterProvider', 'FLAPPER_CONSTANTS',
            function($stateProvider, $urlRouterProvider, FLAPPER_CONSTANTS) {

                $urlRouterProvider.when('/flapper', '/flapper/home');


                $stateProvider
                    .state('flapper', {
                        // abstract: true,
                        url: '/flapper',
                        templateUrl: FLAPPER_CONSTANTS.templates.flapperIndexTemplate
                    })
                    .state('flapper.home', {
                        url: '/home',
                        templateUrl: FLAPPER_CONSTANTS.templates.homeTemplate,
                        controller: 'FlapperMainController',
                        resolve: {
                            resolvedPosts: ['PostService', function(PostService) {
                                return PostService.getAll();
                            }]
                        }
                    })
                    .state('flapper.post', {
                        url: '/posts/{id}',
                        templateUrl: FLAPPER_CONSTANTS.templates.postsTemplate,
                        controller: 'FlapperPostsController',
                        resolve: {
                            resolvedPost: ['$stateParams', 'PostService', function($stateParams, PostService) {
                                return PostService.get($stateParams.id);
                            }]
                        }
                    });
            }
        ]);


    angular.module('flapperApp', [])

    .constant('FLAPPER_CONSTANTS', {
        api_url: '/api/flapper/',
        templates: {
            flapperIndexTemplate: 'mean-app/flapper-app/flapper-app-index.html',
            homeTemplate: 'mean-app/flapper-app/flapper-home.html',
            postsTemplate: 'mean-app/flapper-app/flapper-posts.html'
        }
    })

    .factory('PostService', ['$http', 'authentication', 'FLAPPER_CONSTANTS',
        function($http, authentication, FLAPPER_CONSTANTS) {
            var o = {
                postCollection: []
            };
            o.getAll = function() {
                return $http.get(FLAPPER_CONSTANTS.api_url + 'posts').success(function(data) {
                    angular.copy(data, o.postCollection);
                });
            };
            o.create = function(post) {
                return $http.post(FLAPPER_CONSTANTS.api_url + 'posts', post, {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    }
                }).success(function(data) {
                    o.postCollection.push(data);
                });
            };
            o.upvote = function(post) {
                return $http.put(FLAPPER_CONSTANTS.api_url + 'posts/' + post._id + '/upvote', null, {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    }
                }).success(function(data) {
                    post.votes += 1;
                });
            };
            o.downvote = function(post) {
                return $http.put(FLAPPER_CONSTANTS.api_url + 'posts/' + post._id + '/downvote').success(function(data) {
                    post.votes -= 1;
                });
            };
            o.get = function(id) {
                return $http.get(FLAPPER_CONSTANTS.api_url + 'posts/' + id).then(function(res) {
                    return res.data;
                });
            };

            o.addComment = function(id, comment) {
                return $http.post(FLAPPER_CONSTANTS.api_url + 'posts/' + id + '/comments', comment, {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    }
                });
            };
            o.upvoteComment = function(post, comment) {
                return $http.put(FLAPPER_CONSTANTS.api_url + 'posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    }
                }).success(function(data) {
                    comment.votes += 1;
                });
            };

            o.downvoteComment = function(post, comment) {
                return $http.put(FLAPPER_CONSTANTS.api_url + 'posts/' + post._id + '/comments/' + comment._id + '/downvote').success(function(data) {
                    comment.votes -= 1;
                });
            };
            return o;
        }
    ])

    .controller('FlapperNavController', ['$scope', 'authentication',
        function($scope, authentication) {
            $scope.isLoggedIn = authentication.isLoggedIn;
            $scope.currentUser = authentication.currentUser;
            $scope.logOut = authentication.logOut;
        }
    ])


    .controller('FlapperMainController', ['$scope', 'resolvedPosts', 'PostService', 'authentication',
        function($scope, resolvedPosts, PostService, authentication) {
            $scope.isLoggedIn = authentication.isLoggedIn;
            $scope.test = 'Hello world!';
            $scope.posts = resolvedPosts.data;

            $scope.addPost = function() {
                if ($scope.title.length === 0) {
                    alert('Title is required!');
                    return;
                }

                //regex from https://gist.github.com/jpillora/7885636

                var isValidUrl = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

                var url = $scope.link;

                //link is not required, but if present it must be valid

                if ($scope.link && !isValidUrl.test(url)) {
                    alert('You must include a full valid url! (ex: http://www.example.com)');
                    return;
                }

                PostService.create({
                    title: $scope.title,
                    link: $scope.link,
                }).finally(function() {
                    $scope.posts = PostService.postCollection;
                });

                //clear the values
                $scope.title = '';
                $scope.link = '';
            };

            $scope.upvote = function(post) {
                PostService.upvote(post);
            };
            $scope.downvote = function(post) {
                PostService.downvote(post);
            };
        }
    ])

    .controller('FlapperPostsController', ['$scope', '$stateParams', 'PostService', 'resolvedPost', 'authentication',
        function($scope, $stateParams, PostService, resolvedPost, authentication) {
            $scope.isLoggedIn = authentication.isLoggedIn;
            $scope.post = resolvedPost;

            $scope.addComment = function() {
                if ($scope.body === '') {
                    return;
                }
                PostService.addComment(resolvedPost._id, {
                    body: $scope.body,
                    author: 'user',
                }).success(function(comment) {
                    $scope.post.comments.push(comment);
                });
                $scope.body = '';
            };

            $scope.upvote = function(comment) {
                PostService.upvoteComment(resolvedPost, comment);
            };

            $scope.downvote = function(comment) {
                PostService.downvoteComment(resolvedPost, comment);
            };
        }
    ]);


})();
