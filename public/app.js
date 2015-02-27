'use strict';
// Declare app level module which depends on views, and components
var app = angular.module('bcdevxApp', [
  'ngRoute',
  'bcdevxApp.home',
  'bcdevxApp.auth'
])
   .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/home'});
}]).run(function($rootScope, $http) {
        // Add config to ALL scopes, only makes sense instead of passing in everywhere
        $http.get('/config').
            success(function(data, status, headers, config) {
                $rootScope.config = data;
            });
});

app.controller('IndexCtrl', function($scope, $location, $anchorScroll) {

});

// Init all popovers
$(function () {
    $('[data-toggle="popover"]').popover({html:true})
})