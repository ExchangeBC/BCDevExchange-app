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
angular.module('bcdevxApp.programs')
.factory('ProgramListService', ['$resource', function($resource) {
    return $resource('/api/programs')
}])
.controller('ProgramsCtrl', ['$scope', 'ProgramListService', '$q', 'usSpinnerService',
    function($scope, ProgramListService, $q, usSpinnerService) {

    // Array of programs
    $scope.programs = []
    $scope.programsLoaded = false
    $scope.predicateTitle = ''

    // Array of alerts
    $scope.alerts = []

    $scope.startSpin = function(){
        usSpinnerService.spin('spinner-1')
    }

    $scope.stopSpin = function(){
        usSpinnerService.stop('spinner-1')
    }

    var programListDeferred = $q.defer()
    var programPromise = programListDeferred.promise

    var sourceListDeferred = $q.defer()
    var sourcePromise = sourceListDeferred.promise

    programPromise.then(
        function(){
            usSpinnerService.stop('spinner-programs')
        }
    )

    sourcePromise.then(
        function(){
            usSpinnerService.stop('spinner-sources')
        }
    )

    ProgramListService.get({}, function(data) {

        $scope.programs = data.programs
        programListDeferred.resolve('resource list length: ' + data.programs.length)
        $scope.programsLoaded = true

    }, function(error) {
        $scope.alerts.push({ type: 'warning', msg: 'There was an error accessing data from <strong>' + error.config.url + '</strong>.' })
        programListDeferred.resolve('error retrieving programs for  ' + error.config.url)
        $scope.programsLoaded = true
    })
}])