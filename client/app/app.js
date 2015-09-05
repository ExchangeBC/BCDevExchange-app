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

// Declare app level module which depends on views, and components
'use strict'
var app = angular.module('bcdevxApp', [
    'ngRoute',
    'bcdevxApp.home',
    'bcdevxApp.services',
    'bcdevxApp.account',
    'bcdevxApp.resources',
    'bcdevxApp.resources-register',
    'bcdevxApp.programs',
    'bcdevxApp.blog',
    'bcdevxApp.projects',
    'bcdevxApp.projects-register',
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
    'ngAnimate',
    'btford.markdown',
    'rt.encodeuri',
    'ui.utils',
    'angular-toc',
    'duScroll'
])

// Config scroll offsets
app.value('duScrollGreedy', true)
app.value('duScrollOffset', 80)

app.config(['$routeProvider', '$httpProvider', '$locationProvider',
    function ($routeProvider, $httpProvider, $locationProvider) {


    // check if user is connected
    var checkLoggedIn = function ($q, $timeout, $location, AccountService) {
      var deferred = $q.defer()
      var promise = AccountService.getCurrentAccount()

      promise.then(
        function (data) {
          deferred.resolve(data)
        },
        function (data) {
          //console.log('Did not find logged-in user')
          //var modalInstance = $modal.open({
          //    templateUrl: 'login/login.html',
          //    controller: 'LoginModalCtrl'
          //})
          deferred.reject(data)
        }
      )

      return deferred.promise
    }

    $routeProvider
      .when('/home', {
        templateUrl: '/app/home/home.html',
        controller: 'HomeCtrl'
      })
      .when('/signup', {
        templateUrl: '/app/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/account', {
        templateUrl: '/app/account/account.html',
        controller: 'AccountCtrl',
        resolve: {
          currentUser: checkLoggedIn
        }
      })
      .when('/lab', {
        templateUrl: '/app/lab/lab.html',
        controller: 'LabCtrl'
      })
      .when('/resources', {
        templateUrl: '/app/resources/resources.html',
        controller: 'ResourcesCtrl'
      })
      .when('/resources/register', {
        templateUrl: '/app/resources/register.html',
        controller: 'ResourcesRegisterController'
      })
      .when('/programs', {
        templateUrl: '/app/programs/programs.html',
        controller: 'ProgramsCtrl'
      })
      .when('/blog', {
        templateUrl: '/app/blog/blog.html',
        controller: 'BlogCtrl'
      })
      .when('/projects', {
        templateUrl: '/app/projects/projects.html',
        controller: 'ProjectsCtrl'
      })
      .when('/projects/register', {
        templateUrl: '/app/projects/register.html',
        controller: 'ProjectsRegisterController'
      })
      .when('/people', {
        templateUrl: '/app/people/people.html',
        controller: 'PeopleCtrl'
      })
      .when('/disclaimer', {
        templateUrl: '/app/disclaimer/disclaimer.html',
        controller: 'DisclaimerCtrl'
      })
      .when('/numbers', {
        templateUrl: '/app/numbers/numbers.html',
        controller: 'NumbersCtrl'
      })
      .when('/programs/edit', {
        templateUrl: '/app/programs/edit-programs.html',
        controller: 'ProgramsEditCtrl as vm'
      })
      .when('/programs/:programName', {
        templateUrl: '/app/programs/view-program.html',
        controller: 'ViewProgramCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      })

    // add an interceptor for AJAX errors
    $httpProvider.interceptors.push(function ($q, $location) {
      return {
        // optional method
        'responseError': function (rejection) {
          // do something on error
          if (rejection.status === 401) {
            $location.url('/home')
          } else if (rejection.status === 0) {
            //console.log('Bummer, looks like you hit a network connection error, please check your internet connection or make sure the server is running.')
          }
          return $q.reject(rejection)
        }
      }
    })
    $locationProvider.html5Mode(true)
}])

app.config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
  usSpinnerConfigProvider.setDefaults({
    color: 'darkturquoise'
  })
}])

app.run(function ($rootScope, $http) {
  // Add config to ALL scopes, only makes sense instead of passing in everywhere
  $http.get('/config').
  success(function (data) {
    $rootScope.config = data
  })
})

// Common functions for AngularJS
function extendDeep(dst) {
  angular.forEach(arguments, function (obj) {
    if (obj !== dst) {
      angular.forEach(obj, function (value, key) {
        if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
          extendDeep(dst[key], value)
        } else if (dst[key] && dst[key].constructor && dst[key].constructor === Array) {
          dst[key].concat(value)
        } else if (!angular.isFunction(dst[key])) {
          dst[key] = value
        }
      })
    }
  })
  return dst
}

app.controller('bcdevController', ['$scope', function ($scope) {
  $scope.domsLoaded = {
    'header': false,
    'footer': false,
    'mainContent': false
  }
  $scope.notifyLoad = function (nm) {
    $scope.domsLoaded[nm] = true
    for (var property in $scope.domsLoaded) {
      if ($scope.domsLoaded.hasOwnProperty(property)) {
        if (!$scope.domsLoaded[property]) {
          return
        }
      }
    }
    window.wpCustomFn && window.wpCustomFn(jQuery)
  }
}])
app.directive('notifyLoad', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.notifyLoad(attrs.notifyLoad)
    }
  }
})
