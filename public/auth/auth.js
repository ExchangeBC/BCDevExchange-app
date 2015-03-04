'use strict';

var app = angular.module('bcdevxApp.auth', ['ngRoute', 'ngCookies']);

app.config(['$routeProvider', function($routeProvider) {

}]);

app.factory( 'AuthService', ['$http', '$cookieStore', '$location', '$rootScope', function($http, $cookieStore, $location, $rootScope) {

    $rootScope.user = $cookieStore.get('user') || null;


    // Redirect to the given url (defaults to '/')
    function redirect(url) {
        url = url || '/';
        $location.path(url);
    }

    var service = {
        login: function(user) {
            $rootScope.user = user;
        },
        logout: function(redirectTo) {
            $http.post('/logout').then(function() {
                $rootScope.user = null;
                $cookieStore.remove('user');
                redirect(redirectTo);
            });
        },
        isAuthenticated: function() {
            return !!$rootScope.user;
        }
    };

    return service;
}]);

app.controller('AuthCtrl', [function() {

}]);