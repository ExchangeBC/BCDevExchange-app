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

'use strict'
angular.module('bcdevxApp.auth', ['ngRoute', 'bcdevxApp.services'])
.factory( 'AuthService', ['$http', '$location',
    function($http, $location) {

    // Redirect to the given url (defaults to '/')
    function redirect(url) {
        url = url || '/'
        $location.path(url)
    }

    var service = {

        logout: function(redirectTo) {
            $http.post('/logout').then(function() {
                redirect(redirectTo)
            })
        }
    }

    return service
}])
.controller('LoginModalCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel')
    }

}])
