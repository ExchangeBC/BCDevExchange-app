'use strict';

angular.module('bcdevxApp.auth', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'auth/login.html',
            controller: 'AuthCtrl'
        });
    }])

    .controller('AuthCtrl', [function() {

    }]);