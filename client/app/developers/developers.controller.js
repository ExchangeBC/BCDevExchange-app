'use strict'

angular.module('bcdevxApp.developers', ['ngRoute', 'ngResource', 'bcdevxApp.services'])
  .controller('DevelopersCtrl', function ($scope, $route, $resource, usSpinnerService, $q) {

    var Issues = $resource("/api/issues/:program")
    var closedIssues = $resource("/api/issues?state=closed")
    $q.all([Issues.get({}).$promise,closedIssues.get({}).$promise]).then(function(values){
      //the response is wrapped in  a map, keyed with "issues" - we just want the value of issues (an array of issues)
      $scope.issues = values[0].issues
      $scope.closedIssues = values[1].issues
      usSpinnerService.stop('spinner-issues-list')
    })
  })
