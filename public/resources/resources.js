'use strict';

angular.module('bcdevxApp.resources', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/resources', {
            templateUrl: 'resources/resources.html',
            controller: 'ResourcesCtrl'
        });
    }])

    .factory('ResourceList', ['$resource', function($resource) {
        return $resource('/resources');
    }])


    .controller('ResourcesCtrl', ['$rootScope', '$scope', '$location', '$window', 'ResourceList', function($rootScope, $scope, $location, $window, ResourceList) {
        ResourceList.get({}, function(data) {

            $scope.resources = data.resources;

        });
    }]);