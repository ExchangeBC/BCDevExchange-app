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

angular.module('bcdevxApp.navigation', [])
.controller('NavCtrl', ['$scope', '$modal', 'AuthService', function($scope, $modal, AuthService) {
    $scope.logout = function() {
        AuthService.logout();
    };

    $scope.login = function() {
        var modalInstance = $modal.open({
            templateUrl: 'auth/login.html',
            controller: 'LoginModalCtrl'
        });
    };

}])

.directive('showOnLoggedIn', ['$rootScope', 'AuthService', function($rootScope, AuthService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var prevDisp = element.css('display');

            $rootScope.$watch('user', function(user) {
                if(!AuthService.isAuthenticated()){
                    element.css('display', 'none');
                }else{
                    $rootScope.user.displayName = "fetching ...";
                    element.css('display', 'inline');
                }
            });
        }
    };
}])

.directive('showOnLoggedOut', ['$rootScope', 'AuthService', function($rootScope, AuthService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var prevDisp = element.css('display');
            $rootScope.$watch('user', function(user) {
                if(AuthService.isAuthenticated())
                    element.css('display', 'none');
                else
                    element.css('display', prevDisp);
            });
        }
    };
}]);