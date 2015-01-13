'use strict';

angular.module('bcdevxApp.learn', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/learn', {
            templateUrl: 'learn/learn.html',
            controller: 'LearnCtrl'
        });
    }])

    .controller('LearnCtrl', [function() {

    }]);