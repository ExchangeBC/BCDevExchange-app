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
angular.module('bcdevxApp.auth')
.directive('devxLoginList', ['$rootScope', 'AccountService', function ($rootScope, AccountService) {
    return {
        restricted: 'EA',
        scope: {
            clazz:'@class',
            analytics: '@'
        },
        templateUrl: 'app/login/login-list.html',


        controller: ['$scope', '$rootScope', '$modal', 'AuthService',
            function (scope, rootScope, $modal, AuthService) {

            var vm = this;
            vm.logout = function () {
                vm.username = '';
                AuthService.logout();
            };

            vm.login = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'app/login/login.html',
                    controller: 'LoginModalCtrl'
                });
            };


            var promise = AccountService.getCurrentUser();
                promise.then(
                    function(data){
                        vm.username = data.displayName;
                        vm.userid = data.id;
                        vm.doShow = true;
                    },
                    function(data){
                        vm.username = '';
                        vm.doShow = true;
                    }
                );

        }],
        controllerAs: 'loginlistCtrl',

        link: function(scope, iElement, iAttrs){
            iElement.children()[0].className = scope.clazz;
        }

    };

}]);
