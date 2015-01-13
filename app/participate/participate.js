'use strict';

angular.module('bcdevxApp.participate', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/participate', {
            templateUrl: 'participate/participate.html',
            controller: 'ParticipateCtrl'
        });
    }])

    .controller('ParticipateCtrl', [function() {

    }]);