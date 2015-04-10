//(function() {
    'use strict';

    app = angular.module('bcdevxApp.auth');

    var devxDirectives = {};

    devxDirectives.devxLoginList = function ($rootScope, AccountService) {
        return {
            restricted: 'EA',
            scope: {
                clazz:'@class',
                analytics: '@'
            },
            templateUrl: 'login/login-list.html',


            controller: ['$scope', '$rootScope', '$modal', 'AuthService',
                function (scope, rootScope, $modal, AuthService) {

                var vm = this;
                vm.logout = function () {
                    vm.username = '';
                    AuthService.logout();
                };

                vm.login = function () {
                    var modalInstance = $modal.open({
                        templateUrl: 'login/login.html',
                        controller: 'LoginModalCtrl'
                    });
                };


                var promise = AccountService.getCurrentUser();
                    promise.then(
                        function(data){
                            vm.username = data.displayName;
                            vm.userid = data.id;
                        },
                        function(data){
                            vm.username = '';
                        }
                    );

            }],
            controllerAs: 'loginlistCtrl',

            link: function(scope, iElement, iAttrs){
                iElement.children()[0].className = scope.clazz;
            }

        }

    }

    app.directive(devxDirectives);

//})();