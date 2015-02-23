'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('bcdevxApp', [
  'ngRoute',
  'bcdevxApp.home',
  'bcdevxApp.auth'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}]);

app.controller('IndexCtrl', function($scope, $location, $anchorScroll) {
});