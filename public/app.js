/*
 Copyright 2015 Province of British Columbia

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';
// Declare app level module which depends on views, and components
var app = angular.module('bcdevxApp', [
  'ngRoute',
  'bcdevxApp.home',
  'bcdevxApp.auth',
  'bcdevxApp.account',
  'bcdevxApp.resources',
    'bcdevxApp.projects',
    'bcdevxApp.people',
    'bcdevxApp.navigation',
    'angulartics',
    'angulartics.google.analytics',
    'ui.bootstrap'
])
   .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {


        // check if user is connected
        var checkLoggedIn = function($q, $timeout, $location, AuthService, $modal) {
            // initialize a new promise
            var deferred = $q.defer();

            if (AuthService.isAuthenticated()) {
                $timeout(deferred.resolve, 0);
            } else {
                $timeout(function() {deferred.reject();}, 0);

                var modalInstance = $modal.open({
                    templateUrl: 'auth/login.html',
                    controller: 'LoginModalCtrl'
                });

            }

            return deferred.promise;
        };

        $routeProvider
            .when('/home', {
                templateUrl: 'home/home.html',
                controller: 'HomeCtrl'
            })
            .when('/signup', {
                templateUrl: 'auth/signup.html',
                controller: 'AuthCtrl'
            })
            .when('/account', {
                templateUrl: 'account/account.html',
                controller: 'AccountCtrl',
                resolve: {
                    loggedin: checkLoggedIn
                }
            })
            .when('/resources', {
                templateUrl: 'resources/resources.html',
                controller: 'ResourcesCtrl'
            })
            .when('/projects', {
                templateUrl: 'projects/projects.html',
                controller: 'ProjectsCtrl'
            })
            .when('/people', {
                templateUrl: 'people/people.html',
                controller: 'PeopleCtrl'
            })
            .otherwise({redirectTo: '/home'});

        // add an interceptor for AJAX errors
        $httpProvider.responseInterceptors.push(function($q, $location) {
            return function(promise) {
                return promise.then(
                    // success
                    function(response) {
                        return response;
                    },
                    // error
                    function(response) {
                        if (response.status === 401) {
                            $location.url('/login');
                        }
                        return $q.reject(response);
                    }
                );
            }
        });

}]).run(function($rootScope, $http) {
        // Add config to ALL scopes, only makes sense instead of passing in everywhere
        $http.get('/config').
            success(function(data, status, headers, config) {
                $rootScope.config = data;
            });


});

app.controller('IndexCtrl', ['$anchorScroll', function($anchorScroll) {


}]);

// Init all popovers
$(function () {
    $('[data-toggle="popover"]').popover({html:true})
})
