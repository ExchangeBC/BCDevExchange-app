/**
 * Created by yilingfamily on 15-04-15.
 */
'use strict';


angular.module('bcdevxApp.programs').
    config(['markdownConverterProvider', function (markdownConverterProvider) {


        var devxFilter = function(converter) {
            return [
                // Replace escaped @ symbols
                { type: 'lang', filter: function(text) {
                    return text.replace(/\\@/, '@');
                }},
                { type: 'lang', filter: function(text) {
                    return text.replace(/<!---/g, '<!--');
                }},
                { type: 'lang', filter: function(text) {
                    return text.replace(/--->/g, '-->');
                }}
            ];
        }

    // options to be passed to Showdown
    // see: https://github.com/coreyti/showdown#extensions
    markdownConverterProvider.config(
        { extensions: [devxFilter] }
    );
}]);

angular.module('bcdevxApp.programs').controller('ProgramsEditCtrl', programsEditCtrl);

function programsEditCtrl(){
    var vm = this;
    vm.mdDisplay ='';

    vm.mdInput='';

    vm.preview = function(){
        //var temp = vm.mdInput.replace(/<!---/g, '<!--');
        //temp = temp.replace(/--->/g, '-->');
        //vm.mdDisplay = temp;

        vm.mdDisplay = vm.mdInput;
        console.log("setting property on display directive ");

    }
}