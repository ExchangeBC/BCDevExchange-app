'use strict';

angular.module('bcdevxApp.developers', ['ngRoute', 'ngResource', 'bcdevxApp.services'])
  .controller('DevelopersCtrl', function ($scope, $route, $resource) {

    var Issues = $resource("/api/issues/:program");

    Issues.get({  }, function(programIssues) {
      //the response is wrapped in  a map, keyed with "issues" - we just want the value of issues (an array of issues)
      $scope.issues = programIssues.issues;
    });

  });
