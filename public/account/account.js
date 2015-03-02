'use strict';

var app = angular.module('bcdevxApp.account', ['ngRoute', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/account', {
        templateUrl: 'account/account.html',
        controller: 'AccountCtrl'
    });
}]);

app.factory('Account', ['$resource', function($resource) {
    return $resource('/account/:id');
}]);

app.controller('AccountCtrl', ['$rootScope', '$scope', '$location', '$window', 'Account', function($rootScope, $scope, $location, $window, Account) {

    Account.get({id: $location.search().id}, function(data) {
        $scope.account = data;
    });

    $scope.update = function(account) {
        Account.save({id: $location.search().id}, account, function() {
            console.log("success");
            $window.location.href = $rootScope.config.labURL;
        })
    }

}]);