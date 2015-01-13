'use strict';

angular.module('bcdevxApp.links', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/links', {
            templateUrl: 'links/links.html',
            controller: 'LinksCtrl'
        });
    }])

    .controller('LinksCtrl', [function() {

    }]);