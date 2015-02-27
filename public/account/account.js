'use strict';

angular.module('bcdevxApp.account', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/account', {
            templateUrl: 'account/account.html',
            controller: 'AccountCtrl'
        });
    }])

    .controller('AccountCtrl', [function() {

    }]);