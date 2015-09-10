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
angular.module('bcdevxApp.blog', ['ngRoute',  'ngResource'])
.factory('BlogListService', ['$resource', function($resource) {
    return $resource('/api/blog')
}])
.controller('BlogCtrl', ['$scope', 'BlogListService', '$q', 'usSpinnerService',
    function($scope, BlogListService, $q, usSpinnerService) {

    // Array of blog entries
    $scope.blog = []
    $scope.blogLoaded = false
    $scope.predicateTitle = ''

    // Array of alerts
    $scope.alerts = []

    $scope.startSpin = function(){
        usSpinnerService.spin('spinner-1')
    }

    $scope.stopSpin = function(){
        usSpinnerService.stop('spinner-1')
    }

    var blogListDeferred = $q.defer()
    var blogPromise = blogListDeferred.promise

    var sourceListDeferred = $q.defer()
    var sourcePromise = sourceListDeferred.promise

    blogPromise.then(
        function(){
            usSpinnerService.stop('spinner-blog')
        }
    )

    sourcePromise.then(
        function(){
            usSpinnerService.stop('spinner-sources')
        }
    )

    BlogListService.get({}, function(data) {

        $scope.blog = data.blog
        blogListDeferred.resolve('resource list length: ' + data.blog.length)
        $scope.blogLoaded = true

    }, function(error) {
        $scope.alerts.push({ type: 'warning', msg: 'There was an error accessing data from <strong>' + error.config.url + '</strong>.' })
        blogListDeferred.resolve('error retrieving blog for  ' + error.config.url)
        $scope.blogLoaded = true
    })
}])
