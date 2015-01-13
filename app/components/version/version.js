'use strict';

angular.module('bcdevxApp.version', [
  'bcdevxApp.version.interpolate-filter',
  'bcdevxApp.version.version-directive'
])

.value('version', '0.1');
