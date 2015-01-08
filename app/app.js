'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ngRoute',
  'myApp.home',
  'myApp.learn',
  'myApp.community',
  'myApp.links',
  'myApp.participate',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}]);

app.controller('IndexCtrl', function($scope, $location, $anchorScroll) {
  $scope.scrollTo = function(id) {
    $location.hash(id);
    $anchorScroll();
  }
});