'use strict';

angular.module('myApp.links', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/links', {
            templateUrl: 'links/links.html',
            controller: 'LinksCtrl'
        });
    }])

    .controller('LinksCtrl', [function() {

    }]);