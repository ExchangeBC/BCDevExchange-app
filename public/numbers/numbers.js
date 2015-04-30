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

angular.module('bcdevxApp.numbers', ['ngRoute',  'ngResource'])

    .config(['$routeProvider', function($routeProvider) {

    }])

    .factory('NumbersCountService', ['$resource', function($resource) {
        return $resource('/numbers');
    }])

    .controller('NumbersCtrl', ['$scope', 'NumbersCountService', '$q', 'usSpinnerService', function($scope, NumbersCountService, $q, usSpinnerService) {
        $scope.numbers = {
            isLoaded: false,
            accounts: '-',
            resources: '-',
            projects: '-',
            bcdevx: {
                stargazers: '-',
                watchers: '-',
                forks: '-'
            },
            bcdevx_activity: [],
            bcgov_activity: [],
            analytics: {
                users: '-'
            }
        };

        NumbersCountService.get({}, function(data) {
            $scope.numbers.isLoaded = true;
            $scope.numbers.accounts = data.githubAccounts;
            $scope.numbers.resources = data.resources;
            $scope.numbers.projects = data.projects;
            $scope.numbers.bcdevx = data.bcdevx;
            $scope.numbers.bcdevx_activity = data.bcdevx_latest;
            $scope.numbers.bcgov_activity = data.bcgov_latest;
            $scope.numbers.analytics = data.analytics || $scope.numbers.analytics;
        });

    }])

    .directive('countUp', ['$compile',function($compile,$timeout) {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            countTo: "=countTo",
            interval: '=interval'
        },
        controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
            $scope.millis = 0;
            if ($element.html().trim().length === 0) {
                $element.append($compile('<span>{{millis}}</span>')($scope));
            } else {
                $element.append($compile($element.contents())($scope));
            }

            var i=0;
            function timeloop () {
                setTimeout(function () {
                    $scope.millis++;
                    $scope.$digest();
                    i++;
                    if (i<$scope.countTo) {
                        timeloop();
                    }
                }, $scope.interval)
            }
            timeloop();
        }]
    }}]);