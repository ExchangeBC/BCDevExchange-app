'use strict';

var app = angular.module('bcdevxApp.auth', ['ngRoute', 'ngCookies']);

app.config(['$routeProvider', function($routeProvider) {

}]);

app.factory( 'AuthService', ['$http', '$cookieStore', '$location', function($http, $cookieStore, $location) {

    var currentUser = $cookieStore.get('user') || null;

    // Redirect to the given url (defaults to '/')
    function redirect(url) {
        url = url || '/';
        $location.path(url);
    }

    var service = {
        login: function(user) {
            currentUser = user;
        },
        logout: function(redirectTo) {
            $http.post('/logout').then(function() {
                currentUser = null;
                redirect(redirectTo);
            });
        },
        isAuthenticated: function() {
            return !!currentUser;
        }
    };

    return service;
}]);

app.controller('AuthCtrl', [function() {

}]);