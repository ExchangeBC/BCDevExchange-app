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
    var $controller, AccountService, deferred, $scope
    beforeEach(inject(function (_$controller_, $rootScope, $q, _AccountService_) {
        $controller = _$controller_
        deferred = $q.defer()
        $scope = $rootScope.$new()
        AccountService = _AccountService_
        spyOn(AccountService, 'getCurrentUser').and.returnValue(deferred.promise)
    }))
    describe('request button', function () {
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
})