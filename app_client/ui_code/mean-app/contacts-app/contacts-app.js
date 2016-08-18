(function() {
  'use strict';

  //@ngdoc config
  //@description Routes for contactsApp
  angular
    .module('meanApp')
    .config(['$stateProvider', '$urlRouterProvider', 'CONTACTS_CONSTANTS',
      function($stateProvider, $urlRouterProvider, CONTACTS_CONSTANTS) {

        $urlRouterProvider.when('/contacts', '/contacts/list');


        $stateProvider
          .state('contacts', {
            // abstract: true,
            url: '/contacts',
            templateUrl: CONTACTS_CONSTANTS.templates.contactsIndexTemplate,
            controller: ['$scope', 'CONTACTS_CONSTANTS', function($scope, CONTACTS_CONSTANTS) {
              $scope.headerTemplate = CONTACTS_CONSTANTS.templates.contactsHeaderTemplate;
              $scope.logoImg = CONTACTS_CONSTANTS.imgUrl.contactLogo;
            }]
          })
          .state('contacts.list', {
            url: '/list',
            templateUrl: CONTACTS_CONSTANTS.templates.contactListTemplate,
            controller: 'ContactsListController',
            resolve: {
              resolvedContacts: ['ContactsService', function(ContactsService) {
                return ContactsService.getContacts();
              }]
            }

          })
          .state('contacts.new', {
            url: '/new',
            templateUrl: CONTACTS_CONSTANTS.templates.contactFormTemplate,
            controller: 'NewContactController'
          })
          .state('contacts.edit', {
            url: '/:id',
            templateUrl: CONTACTS_CONSTANTS.templates.contactInfoTemplate,
            controller: 'EditContactController'
          });
      }
    ]);


  angular
    .module('contactsApp', [])
    .constant('CONTACTS_CONSTANTS', {
      api_url: '/api/contacts',
      templates: {
        contactsIndexTemplate: 'mean-app/contacts-app/contacts-app-index.html',
        contactsHeaderTemplate: 'mean-app/contacts-app/contacts-app-header.html',
        contactListTemplate: 'mean-app/contacts-app/contact-list.html',
        contactFormTemplate: 'mean-app/contacts-app/contact-form.html',
        contactInfoTemplate: 'mean-app/contacts-app/contact-info.html'
      },
      imgUrl:{
        contactLogo: 'images/contacts-app-brand.jpg'
      }
    })

  .service('ContactsService', ['$http',
    function($http) {
      this.getContacts = function() {
        return $http.get('/api/contacts').then(function(response) {
          return response;
        });
      };
      this.createContact = function(contact) {
        return $http.post('/api/contacts', contact).then(function(response) {
          return response;
        });
      };
      this.getContact = function(contactId) {
        return $http.get('/api/contacts/' + contactId).then(function(response) {
          return response;
        });
      };
      this.editContact = function(contact) {
        return $http.put(url, '/api/contacts/' + contact._id).then(function(response) {
          return response;
        });
      };
      this.deleteContact = function(contactId) {
        return $http.delete('/api/contacts/' + contactId).then(function(response) {
          return response;
        });
      };
    }
  ])

  .controller('ContactsListController', ['resolvedContacts', '$scope',
    function(resolvedContacts, $scope) {
      $scope.contacts = resolvedContacts.data;
    }
  ])

  .controller('NewContactController', ['$scope', '$state', 'ContactsService',
    function($scope, $state, ContactsService) {
      $scope.back = function() {
        $state.go('contacts.list');
      };

      $scope.saveContact = function(contact) {
        ContactsService.createContact(contact).then(function(doc) {
          $state.go('contacts.edit', { id: doc.data._id });
        }, function(response) {
          alert(response);
        });
      };
    }
  ])

  .controller('EditContactController', ['$scope', '$stateParams', 'ContactsService',
    function($scope, $stateParams, ContactsService) {

      ContactsService.getContact($stateParams.id).then(function(doc) {
        $scope.contact = doc.data;
      }, function(response) {
        alert(response);
      });

      $scope.toggleEdit = function() {
        $scope.editMode = true;
        $scope.contactFormUrl = 'mean-app/contacts-app/contact-form.html';
      };

      $scope.back = function() {
        $scope.editMode = false;
        $scope.contactFormUrl = '';
      };

      $scope.saveContact = function(contact) {
        ContactsService.editContact(contact);
        $scope.editMode = false;
        $scope.contactFormUrl = '';
      };

      $scope.deleteContact = function(contactId) {
        ContactsService.deleteContact(contactId);
      };
    }
  ]);
})();
