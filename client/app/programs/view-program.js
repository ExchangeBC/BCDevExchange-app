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

angular.module('bcdevxApp.programs').controller('ViewProgramCtrl', ['ProgramService', '$routeParams', '$rootScope', '$scope', 'Programs', 'usSpinnerService', function (ProgramService, $routeParams, $rootScope, $scope, Programs, usSpinnerService) {
    $scope.mdDisplay = ''

    var mdContentPromise = ProgramService.getProgramByName($routeParams.programName)
    $scope.programName = $routeParams.programName
    $scope.programs = Programs
    mdContentPromise.then(function (program) {
      usSpinnerService.stop('spinner-program-desc')
      if (!!program) {
        $scope.program = program
        $scope.mdDisplay = program.markdown
        $rootScope.$broadcast('bdTocUpdate')
        $scope.$broadcast('contentReady')
      } else {
        $scope.mdDisplay = 'No content found for program named \'' + $routeParams.programName + '\'.'
      }

    }, function (errorMessage) {
      $scope.mdDisplay = errorMessage
    })
}
])


angular.module('bcdevxApp.programs').directive('inlineEditable', ['AccountService', function (AccountService) {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      $scope.$on('contentReady', function () {
        AccountService.getCurrentUser().then(function (currUser) {
          if (!currUser.siteAdmin && (!$scope.program.editors || $scope.program.editors.indexOf(currUser.id) < 0)) {
            return
          }
          element.attr('contenteditable', true)
            // Turn off automatic editor creation first.
          window.CKEDITOR.disableAutoInline = true
            // don't show tooltip besides cursor
          window.CKEDITOR.config.title = false
          var editor = window.CKEDITOR.inline(element[0])
          var fldArr = attrs.ngBindHtml && attrs.ngBindHtml.split('.')
          fldArr.splice(0, 1)
          editor.field = fldArr.join('.')
          editor.setData(_.get($scope.program, editor.field))
          editor.on('blur', function (evt) {
            if (_.get($scope.program, this.field, {}) === this.getData()) {
              return
            }
            _.set($scope.program, this.field, this.getData())
            $scope.programs.update({
              id: $scope.program.id
            }, _.set({}, this.field, this.getData()))
          })
        })
      })
    }
  }
}])
