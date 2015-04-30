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

angular.module('bcdevxApp.projects', ['ngRoute',  'ngResource'])

    .config(['$routeProvider', function($routeProvider) {

    }])

    .factory('ProjectListService', ['$resource', function($resource) {
        return $resource('/projects');
    }])

    .factory('ProjectDetailsService', function($resource){
        return $resource('/projects/:source/url/:url', {source:'@source', url:'@url'})
    })

    .controller('ProjectsCtrl', ['$scope', 'ProjectListService', 'ProjectDetailsService', '$q', 'usSpinnerService',
        function($scope, ProjectListService, ProjectDetailsService, $q, usSpinnerService) {

        // Array of projects
        $scope.projects = [];
        $scope.projectsLoaded = false;
        $scope.predicateTitle = '';

        // Array of alerts
        $scope.alerts = [];

        $scope.startSpin = function(){
            usSpinnerService.spin("spinner-1");
        }
        $scope.stopSpin = function(){
            usSpinnerService.stop("spinner-1");
        }

        var projectListDeferred = $q.defer();
        var projectPromise = projectListDeferred.promise;

        var sourceListDeferred = $q.defer();
        var sourcePromise = sourceListDeferred.promise;

        projectPromise.then(
            function(value){
                usSpinnerService.stop("spinner-projects")
            }
        );
        sourcePromise.then(
            function(value){
                usSpinnerService.stop("spinner-sources")
            }
        );

        ProjectListService.get({}, function(data) {

            $scope.projects = data.projects;
            projectListDeferred.resolve("resource list length: " + data.projects.length);
            $scope.projectsLoaded = true;

            angular.forEach($scope.projects, function (project, key) {
                ProjectDetailsService.get({source:project.source, url: project.url}, function(detailProject) {
                    extendDeep($scope.projects[key], detailProject);

                    // flatten model for angularjs sort
                    angular.forEach($scope.projects[key].issues, function (issue, issueKey) {
                        $scope.projects[key]["_count_" + issue.id] = issue.count;
                    });
                });
            });
        }, function(error) {
            console.log(error);
            $scope.alerts.push({ type: 'warning', msg: 'There was an error accessing data from <strong>' + error.config.url + '</strong>.' });
            projectListDeferred.resolve("error retrieving resources for  " + error.config.url);
            $scope.projectsLoaded = true;
        });
    }]);