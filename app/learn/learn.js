'use strict';

angular.module('myApp.learn', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/learn', {
            templateUrl: 'learn/learn.html',
            controller: 'LearnCtrl'
        });
    }])

    .controller('LearnCtrl', [function() {

    }]);