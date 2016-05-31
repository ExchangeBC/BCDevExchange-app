'use strict';

angular.module('bcdevxApp.developers', ['ngRoute', 'ngResource', 'bcdevxApp.services'])
  .controller('DevelopersCtrl', function ($scope, $route, $resource, usSpinnerService, $q) {

    var openIssues = $resource("/api/issues/:program");
    var closedIssues = $resource("/api/issues?state=closed");
    $q.all([openIssues.get({}).$promise, closedIssues.get({}).$promise]).then(function (values) {
      //the response is wrapped in  a map, keyed with "issues" - we just want the value of issues (an array of issues)
      var openIssues = values[0].issues;

      // this is for populating "Open Opportunities" - it will contain all open, *unassigned* issues labelled "help wanted", with or without an amount label.
      $scope.issues = _.filter(openIssues, function (issue) {
        return issue.assignee == null;
      });

      // this is for populating "Work In Progress " - it will contain all open, *assigned* issues labelled "help wanted", with or without an amount label
      $scope.assignedIssues = _.filter(openIssues, function (issue) {
        console.log("assignee: " + issue.assignee);
        return issue.assignee != null;
      });

      // this is for populating "Closed Opportunities" - it will contain all closed issues labelled "help wanted", with or without an amount label
      $scope.closedIssues = values[1].issues;
      usSpinnerService.stop('spinner-issues-list');
    })
  });
