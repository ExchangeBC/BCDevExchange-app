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

angular.module('bcdevxApp.services').factory('ProgramService', ['$resource', '$q', programService]);

function programService($resource, $q) {
    var programApi = '/programs/name/';

    return {

        getProgramByName: function(pName) {
            var deferred = $q.defer();

            var res = $resource(programApi + pName);
            res.get([],
                function(program, getResponseHeaders){
                    var md = program.markdown;
                    deferred.resolve(md);
                },
                function(responseError){
                    var errorMsg = "Response error in getting resource from url " + programApi + ", error code: " + responseError.status;
                    deferred.reject("errorMsg");
                }
            );

            return deferred.promise;
        }
    };
}