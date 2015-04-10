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

var app = angular.module('bcdevxApp.account', ['ngRoute', 'ngResource', 'ngMessages']);


app.controller('AccountCtrl', ['$rootScope', '$scope', '$location', '$window', 'AccountService',
    function($rootScope, $scope, $location, $window, AccountService) {

    $scope.formLevelMessage = '';
    $scope.formError = false;
    $scope.accountExistsMap = new Map();
    $scope.resultOfSaving = {success:false, error:false};
    $scope.notifs = {};

    $scope.update = function(account) {
        AccountService.save($location.search().id, account).then(
            function() {
                console.log("successfully saved account.");
                $scope.resultOfSaving = {success:true};
            },
            function() {
                console.log("Error in saving account.");
                $scope.resultOfSaving = {error:true};
            }
        );
    };

    $scope.identityExists = function(identifier) {
        return $scope.accountExistsMap.get(identifier);
    };
    $scope.checkIdentityExists = function(identifier) {
        var exists = $scope.accountExistsMap.get(identifier);

        if(exists === undefined){
            AccountService.getAccountById($location.search().id)
                .then(
                    function(data){
                        for( var i = 0; i < data.identities.length; i++ ) {
                            if ( data.identities[i].origin === identifier ) {
                                $scope.accountExistsMap.set(identifier, true);
                            }
                        }
                    },
                    function(reason){
                        $scope.notifs.push(reason);
                    }
                );
        }
    };

    $scope.init = function(){
        AccountService.getAccountById($location.search().id)
            .then(function(data) {

            $scope.account = data;

            $rootScope.user.displayName = data.profiles[0].name.value;
            $rootScope.id = data._id;
        });

        $scope.checkIdentityExists('github');
        $scope.checkIdentityExists('linkedin');
    };

    $scope.init();


}]);