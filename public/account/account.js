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

var app = angular.module('bcdevxApp.account', ['ngRoute', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) {

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
    };

    $scope.identityExists = function(identifier) {
        var exists = false;
        for( var i = 0; i < $scope.account.identities.length; i++ ) {
            if ( $scope.account.identities[i].origin === identifier ) {
                exists = true;
                break;
            }
        }
        return exists;
    };

}]);