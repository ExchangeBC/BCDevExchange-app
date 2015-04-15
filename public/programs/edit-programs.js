/**
 * Created by yilingfamily on 15-04-15.
 */
'use strict';

angular.module('bcdevxApp.programs').controller('ProgramCtrl', programController);

function programController(){
    var vm = this;
    vm.mdDisplay ='';

    vm.mdInput='';

    vm.preview = function(){
        vm.mdDisplay = angular.copy(vm.mdInput);
    }
}