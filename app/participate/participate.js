'use strict';

angular.module('myApp.participate', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/participate', {
            templateUrl: 'participate/participate.html',
            controller: 'ParticipateCtrl'
        });
    }])

    .controller('ParticipateCtrl', [function() {

    }]);