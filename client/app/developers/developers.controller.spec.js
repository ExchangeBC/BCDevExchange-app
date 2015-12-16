'use strict';

describe('Controller: DeveloperCtrl', function () {

  // load the controller's module
  beforeEach(module('bcdevxApp.developers'));

  var DeveloperCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DeveloperCtrl = $controller('DeveloperCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
