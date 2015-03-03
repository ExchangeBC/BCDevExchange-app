'use strict';
// Declare app level module which depends on views, and components
var app = angular.module('bcdevxApp', [
  'ngRoute',
  'bcdevxApp.home',
  'bcdevxApp.auth',
  'bcdevxApp.account'
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

app.controller('IndexCtrl', function($scope, $location, $anchorScroll) {

});

// Init all popovers
$(function () {
    $('[data-toggle="popover"]').popover({html:true})
})
