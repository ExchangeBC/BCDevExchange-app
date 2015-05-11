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

angular.module('bcdevxApp.services', [])
.factory('AccountService', ['$resource', '$q', '$log', function($resource, $q, $log) {
    var accountService = this;
    var accountUrl = '/account';
    var accountCheckUrl = '/accountCheck';
    /*
      Returns a promise, when resolved with empty object, indicating no authenticated user found.
     */
    accountService.getCurrentUser = function(){
        $log.info('Get session user from server.');
        var deferred = $q.defer();
        var actPromise = $resource(accountCheckUrl).get().$promise;

        var currentUser = {
        };

        actPromise.then(
            function(data){
                if(!!data.profiles){
                    currentUser.displayName = data.profiles[0].name.value;
                    currentUser.id = data._id;
                    deferred.resolve(currentUser);
                }else{
                    //console.log("No authenticated user found.");
                    deferred.resolve(currentUser);
                }
            },
            function(error){
                //console.log("Error in accessing resource: " + accountCheckUrl + ", error code" + error.status);
                currentUser.error = error.toString();
                deferred.reject(currentUser);
            }
        );

        return deferred.promise;
    };

    accountService.getCurrentAccount = function(){
        var accountPromise = $resource(accountUrl).get().$promise;
        return accountPromise;
    };

    accountService.getAccountById = function(accountId){
        var deferred = $q.defer();
        $resource(accountUrl + '/:id').get(
            {id: accountId},

            function(data){
                deferred.resolve(data);
            },
            function(error){
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    accountService.save = function(accountId, accountData){
        var deferred = $q.defer();
        $resource(accountUrl + '/:id').save(
            {id: accountId},
            accountData,

            function(data){
                deferred.resolve(data);
            },
            function(error){
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };
    return accountService;
}]);