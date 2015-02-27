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

app.controller('AccountCtrl', ['$scope', '$location', 'Account', function($scope, $location, Account) {

    var account = Account.get({id: $location.search().id}, function(data) {
        $scope.account = data;
    });

}]);