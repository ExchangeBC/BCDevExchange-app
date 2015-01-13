'use strict';

angular.module('bcdevxApp.licenses', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/licenses', {
            templateUrl: 'licenses/licenses.html',
            controller: 'LicensesCtrl'
        });
    }])

    .controller('LicensesCtrl', [function() {

    }]);