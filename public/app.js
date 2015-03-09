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
  'bcdevxApp.auth',
  'angulartics',
  'angulartics.google.analytics'
  'ngRoute',
    'ngRoute',
  'bcdevxApp.home',
    'bcdevxApp.home',
  'bcdevxApp.auth',
  'bcdevxApp.account',
  'bcdevxApp.resources'
])
   .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {


        // check if user is connected
        var checkLoggedIn = function($q, $timeout, $location, AuthService) {
            // initialize a new promise
            var deferred = $q.defer();

            if (AuthService.isAuthenticated()) {
                $timeout(deferred.resolve, 0);
            } else {
                $timeout(function() {deferred.reject();}, 0);
                $location.url('/login');
            }

            return deferred.promise;
        };

        $routeProvider
            .when('/home', {
                templateUrl: 'home/home.html',
                controller: 'HomeCtrl'
            })
            .when('/login', {
                templateUrl: 'auth/login.html',
                controller: 'AuthCtrl'
            })
            .when('/account', {
                templateUrl: 'account/account.html',
                controller: 'AccountCtrl',
                resolve: {
                    loggedin: checkLoggedIn
                }
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

app.directive('showOnLoggedIn', ['$rootScope', 'AuthService', function($rootScope, AuthService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var prevDisp = element.css('display');
            $rootScope.$watch('user', function(user) {
                if(!AuthService.isAuthenticated())
                    element.css('display', 'none');
                else
                    element.css('display', prevDisp);
            });
        }
    };
    'bcdevxApp.auth',
    'angulartics',
    'angulartics.google.analytics'
]).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/home'});
}]);

app.directive('showOnLoggedOut', ['$rootScope', 'AuthService', function($rootScope, AuthService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var prevDisp = element.css('display');
            $rootScope.$watch('user', function(user) {
                if(AuthService.isAuthenticated())
                    element.css('display', 'none');
                else
                    element.css('display', prevDisp);
            });
        }
    };
}]);

app.controller('IndexCtrl', ['$scope', '$location', '$anchorScroll', 'AuthService', function($scope, $location, $anchorScroll, AuthService) {
    $scope.logout = function() {
        AuthService.logout();
    };

}]);

// Init all popovers
$(function () {
    $('[data-toggle="popover"]').popover({html:true})
})

app.controller('IndexCtrl', function($scope, $location, $anchorScroll) {
});