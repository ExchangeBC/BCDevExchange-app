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

angular.module('bcdevxApp.apiExplorer', ['swaggerUi'])
  .run(function (swaggerModules, swaggerUiExternalReferences, swagger1ToSwagger2Converter) {
    swaggerModules.add(swaggerModules.BEFORE_PARSE, swagger1ToSwagger2Converter);
    swaggerModules.add(swaggerModules.BEFORE_PARSE, swaggerUiExternalReferences);
  })
  .controller('ViewApiCtrl', ['$scope','$routeParams', function ($scope,$routeParams) {
    $scope.url = $scope.swaggerUrl = '/assets/swaggers/' + $routeParams.swaggerUrl + '.json'
      // http://petstore.swagger.io/v2/swagger.json
      //https://api.bcdevexchange.org/apim/store/api-docs/admin/OPEN511/1.0.0
}])