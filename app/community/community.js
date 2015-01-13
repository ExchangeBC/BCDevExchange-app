'use strict';

angular.module('bcdevxApp.community', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/community', {
            templateUrl: 'community/community.html',
            controller: 'CommunityCtrl'
        });
    }])

    .controller('CommunityCtrl', [function() {

    }]);