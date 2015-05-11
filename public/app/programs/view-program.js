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

angular.module('bcdevxApp.programs').controller('ViewProgramCtrl', ['ProgramService','$routeParams','$rootScope',viewProgramCtrl]);

function viewProgramCtrl(ProgramService, $routeParams, $rootScope){
    var vm = this;
    vm.mdDisplay ='';

    var mdContentPromise = ProgramService.getProgramByName($routeParams.programName);
    vm.programName = $routeParams.programName;
    mdContentPromise.then(function(md){
        if(!!md){
            vm.mdDisplay = md;
            $rootScope.$broadcast('bdTocUpdate');
        }else{
            vm.mdDisplay = "No content found for program named '" + $routeParams.programName + '\'.';
        }

    }, function(errorMessage){
        vm.mdDisplay = errorMessage;
    });
}
