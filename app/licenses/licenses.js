'use strict';

angular.module('myApp.licenses', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/licenses', {
            templateUrl: 'licenses/licenses.html',
            controller: 'LicensesCtrl'
        });
    }])

    .controller('LicensesCtrl', [function() {

    }]);