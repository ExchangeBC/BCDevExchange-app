/*
 Copyright 2015 Province of British Columbia

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and limitations under the License.
 */

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
