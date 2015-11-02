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
angular.module('bcdevxApp.blog', ['ngRoute', 'ngResource'])
  .factory('BlogListService', ['$resource', function ($resource) {
      return $resource('/api/blog')
    }])
  .controller('BlogCtrl', ['$scope', 'BlogListService', '$q', 'usSpinnerService', '$filter',
    function ($scope, BlogListService, $q, usSpinnerService, $filter) {

      // Array of blog entries
      $scope.blog = []
      $scope.blogLoaded = true
      $scope.predicateOrder = function (post) {
        var date = new Date(post.pubDate[0])
        return -(date.getTime())
      }

      $scope.predicate = $scope.predicateOrder

      $scope.predicateTitle = ''

      // Array of alerts
      $scope.alerts = []

      $scope.startSpin = function () {
        usSpinnerService.spin('spinner-1')
      }

      $scope.stopSpin = function () {
        usSpinnerService.stop('spinner-1')
      }

      var blogListDeferred = $q.defer()
      var blogPromise = blogListDeferred.promise

      var sourceListDeferred = $q.defer()
      var sourcePromise = sourceListDeferred.promise

      blogPromise.then(
        function () {
          usSpinnerService.stop('spinner-blog')
        }
      )

      sourcePromise.then(
        function () {
          usSpinnerService.stop('spinner-sources')
        }
      )


      $scope.lastReached = false
      $scope.lastReachedText = '+'
      $scope.paginate = function () {
        if ($scope.lastReached)
          return
        var page = Math.ceil($scope.blog.length / 50) + 1
        var opt = (page === 1 ? {} : {p: page})
        if (!$scope.blogLoaded) {
          return
        }
        $scope.blogLoaded = false
        BlogListService.get(opt, function (data) {
          if (!data.blog || data.blog.length < 50) {
            $scope.lastReached = true
            $scope.lastReachedText = ''
            if (!data.blog) {
              return
            }
          }
          $scope.blog = $scope.blog.concat(data.blog)
          blogListDeferred.resolve('resource list length: ' + $scope.blog.length)
          $scope.blogLoaded = true
          if ($scope.blog.length < 1000 && !$scope.lastReached) {
            setTimeout($scope.paginate, 100)
          }
        }, function (error) {
          $scope.alerts.push({type: 'warning', msg: 'There was an error accessing data from <strong>' + error.config.url + '</strong>.'})
          blogListDeferred.resolve('error retrieving blog for  ' + error.config.url)
          $scope.blogLoaded = true
        })
      }
    }])
