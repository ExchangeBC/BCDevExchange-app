'use strict';

angular.module('bcdevxApp.programs', ['ngRoute','ngResource','ngSanitize','btford.markdown', 'ngFx', 'ngAnimate']);


angular.module('bcdevxApp.programs').
    config(['markdownConverterProvider', function (markdownConverterProvider) {

        // options to be passed to Showdown
        // see: https://github.com/coreyti/showdown#extensions
        markdownConverterProvider.config(
            { extensions: ['btexts', 'icon'] }
        );
    }]);
