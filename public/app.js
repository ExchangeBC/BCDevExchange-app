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
    'bcdevxApp.services',
    'bcdevxApp.account',
    'bcdevxApp.resources',
    'bcdevxApp.programs',
    'bcdevxApp.projects',
    'bcdevxApp.people',
    'bcdevxApp.signup',
    'bcdevxApp.auth',
    'bcdevxApp.lab',
    'bcdevxApp.disclaimer',
    'bcdevxApp.numbers',
    'angulartics',
    'angulartics.google.analytics',
    'ui.bootstrap',
    'angularSpinner',
    'angularMoment',
    'ngMessages',
    'ngFx',
    'ngAnimate'
])
   .config(['$routeProvider', '$httpProvider',
        function($routeProvider, $httpProvider) {


        // check if user is connected
        var checkLoggedIn = function($q, $timeout, $location, AccountService, $modal) {
            var deferred = $q.defer();
            var promise = AccountService.getCurrentAccount();

            promise.then(
                function(data){
                        deferred.resolve(data);
                },
                function(data){
                    console.log('Did not find logged-in user');
                    //var modalInstance = $modal.open({
                    //    templateUrl: 'login/login.html',
                    //    controller: 'LoginModalCtrl'
                    //});
                    deferred.reject(data);
                }
            )

            return deferred.promise;
        };

        $routeProvider
            .when('/home', {
                templateUrl: 'home/home.html',
                controller: 'HomeCtrl'
            })
            .when('/signup', {
                templateUrl: 'signup/signup.html',
                controller: 'SignupCtrl'
            })
            .when('/account', {
                templateUrl: 'account/account.html',
                controller: 'AccountCtrl',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
            .when('/lab', {
                templateUrl: 'lab/lab.html',
                controller: 'LabCtrl'
            })
            .when('/resources', {
                templateUrl: 'resources/resources.html',
                controller: 'ResourcesCtrl'
            })
            .when('/programs', {
                templateUrl: 'programs/programs.html',
                controller: 'ProgramsCtrl'
            })
            .when('/projects', {
                templateUrl: 'projects/projects.html',
                controller: 'ProjectsCtrl'
            })
            .when('/people', {
                templateUrl: 'people/people.html',
                controller: 'PeopleCtrl'
            })
            .when('/disclaimer', {
                templateUrl: 'disclaimer/disclaimer.html',
                controller: 'DisclaimerCtrl'
            })
            .when('/numbers', {
                templateUrl: 'numbers/numbers.html',
                controller: 'NumbersCtrl'
            })
            .otherwise({redirectTo: '/home'});

        // add an interceptor for AJAX errors
        $httpProvider.interceptors.push(function($q, $location, $log) {
            return {
                // optional method
                'responseError': function (rejection) {
                    // do something on error
                    if (rejection.status === 401) {
                        $location.url('/home');
                    }else if(rejection.status === 0){
                        console.log('Bummer, looks like you hit a network connection error, please check your internet connection or make sure the server is running.');
                    }
                    return $q.reject(rejection);
                }
            }
        });

}]).config(['usSpinnerConfigProvider', function(usSpinnerConfigProvider) {
        usSpinnerConfigProvider.setDefaults({color: 'darkturquoise'});

    }]).run(function($rootScope, $http) {
        // Add config to ALL scopes, only makes sense instead of passing in everywhere
        $http.get('/config').
            success(function(data, status, headers, config) {
                $rootScope.config = data;
            });


    });

// Common functions for AngularJS
function extendDeep(dst) {
    angular.forEach(arguments, function (obj) {
            if (obj !== dst) {
                angular.forEach(obj, function (value, key) {
                        if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                            extendDeep(dst[key], value);
                        } else if (dst[key] && dst[key].constructor && dst[key].constructor === Array) {
                            dst[key].concat(value);
                        } else if(!angular.isFunction(dst[key])) {
                            dst[key] = value;
                        }
                    }
                );
            }
        }
    );
    return dst;
}

// Init all popovers
$(function () {
    $('[data-toggle="popover"]').popover({html:true})
})