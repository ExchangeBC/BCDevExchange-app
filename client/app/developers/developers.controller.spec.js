'use strict';

describe('Controller: DevelopersCtrl', function () {

  // load the controller's module
  beforeEach(module('bcdevxApp.developers'));

  var DeveloperCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DeveloperCtrl = $controller('DevelopersCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
