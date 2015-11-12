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
angular.module('bcdevxApp.lab', ['ngRoute', 'ngResource', 'bcdevxApp.services', 'ui.grid'])
  .controller('LabCtrl', ['$scope', '$uibModal', 'AccountService', function ($scope, $uibModal, AccountService) {
      AccountService.getCurrentUser().then(
        function (cu) {
          if (!cu.data.labRequestStatus) {
            $scope.showRequestButton = true
          }
          if (cu.data.labRequestStatus === 'pending') {
            $scope.showRequestPendingMsg = true
          }
        }
      )
      $scope.requestAccess = function () {
        $uibModal.open({
          templateUrl: '/app/lab/request-access.html',
          controller: 'LabModalInstanceCtrl',
          resolve: {
            parentScope: function () {
              return $scope
            }
          }
        })
      }
    }])
  .controller('LabModalInstanceCtrl', ['$scope', '$uibModalInstance', '$resource', 'parentScope'
      , function ($scope, $uibModalInstance, $resource, parentScope) {
        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel')
        }
        $scope.submit = function () {
          $resource('/api/lab/request').save(function () {
            $('#lab-request-message').html('Request sent.')
            parentScope.showRequestButton = false
            parentScope.showRequestPendingMsg = true
            $('#lab-request-submit').hide()
            $('#lab-request-cancel').html('Ok')
          }, function (err) {
            $('#lab-request-message').html(err.data || 'Error sending request. Please try later.')
            $('#lab-request-submit').hide()
            $('#lab-request-cancel').html('Ok')
          })
        }
      }])
  .controller('LabAdminCtrl', ['$scope', 'AccountService', '$location', function ($scope, AccountService, $location) {
      $scope.gridOptions = {
        columnDefs: [
          {field: 'User Name'},
          {field: 'Emails', name: 'Emails', cellTemplate: '<div class="lab-admin-emails"><div ng-repeat="item in row.entity[col.field]">{{item}}</div></div>'},
          {field: 'Approval Status'}
        ],
        rowHeight: 50
      }
      AccountService.getCurrentUser().then(
        function (cu) {
          if (!cu.siteAdmin) {
            $location.path('/home')
          }
          AccountService.query({q: {labRequestStatus: 'pending'}}, function (accts) {
            $scope.gridOptions.data = accts.map(function (e, i, a) {
              return {
                'User Name': e.profiles[0].username,
                'Emails': e.profiles[0].contact.email.map(function (e, i, a) {
                  return e.value
                }),
                'Approval Status': e.labRequestStatus
              }
            })
          })
        },
        function () {
          $location.path('/home')
        }
      )
    }])
