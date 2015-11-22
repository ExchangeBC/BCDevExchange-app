/* 
 * Copyright 2015 Province of British Columbia.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe("LabCtrl", function () {
  beforeEach(module('bcdevxApp.lab'))
  var $controller, $scope
  beforeEach(inject(function (_$controller_, $rootScope, $q) {
    $controller = _$controller_
    $scope = $rootScope.$new()
  }))
  describe('request button', function () {
    var AccountService, deferred
    beforeEach(inject(function (_AccountService_, $q) {
      AccountService = _AccountService_
      deferred = $q.defer()
      spyOn(AccountService, 'getCurrentUser').and.returnValue(deferred.promise)
    }))
    it('should show for initial site admins', function () {
      deferred.resolve({
        siteAdmin: true,
        data: {}
      })
      $controller('LabCtrl', {$scope: $scope, $uibModal: {}, AccountService: AccountService
      })
      // call apply to invoke promise then
      $scope.$apply()
      expect(AccountService.getCurrentUser).toHaveBeenCalled()
      expect($scope.showRequestButton).toBe(true)
    })
    it('should not show for approved site admins', function () {
      deferred.resolve({
        siteAdmin: true,
        data: {labRequestStatus: 'approved'}
      })
      $controller('LabCtrl', {$scope: $scope, $uibModal: {}, AccountService: AccountService
      })
      // call apply to invoke promise then
      $scope.$apply()
      expect(AccountService.getCurrentUser).toHaveBeenCalled()
      expect($scope.showRequestButton).toBeUndefined()
    })
    it('should show for initial program owners', function () {
      spyOn(AccountService, 'query').and.callFake(function (q, cb) {
        cb([1])
      })
      deferred.resolve({
        siteAdmin: false,
        data: {}
      })
      $controller('LabCtrl', {$scope: $scope, $uibModal: {}, AccountService: AccountService
      })
      // call apply to invoke promise then
      $scope.$apply()
      expect(AccountService.getCurrentUser).toHaveBeenCalled()
      expect(AccountService.query).toHaveBeenCalled()
      expect($scope.showRequestButton).toBe(true)
    })
  })
  describe('uniqueValidName directive', function () {
    var LabInstances
    beforeEach(inject(function ($compile, _LabInstances_) {
      LabInstances = _LabInstances_
      var element = angular.element(
        '<form name="form">' +
        '<input ng-model="item.name" name="instName" unique-valid-name />' +
        '</form>'
        )
      $scope.item = {}
      $compile(element)($scope)
      form = $scope.form
    }))
    it('should reject duplicated name', function () {
      spyOn(LabInstances, 'query').and.callFake(function (q, cb) {
        cb([1])
      })
      form.instName.$setViewValue('a')
      $scope.$digest()
      expect($scope.item.name).toBeUndefined()
      expect($scope.nameTooltip).toEqual('Name is already taken.')
    })
    it('should accept unique name', function () {
      spyOn(LabInstances, 'query').and.callFake(function (q, cb) {
        cb('')
      })
      form.instName.$setViewValue('a')
      $scope.$digest()
      expect($scope.item.name).toEqual('a')
      expect($scope.nameTooltip).toEqual('Name is available.')
    })
  })
})