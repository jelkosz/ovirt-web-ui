angular.module('bridge.filter')
.filter('ns', function(activeNamespaceSvc) {
  'use strict';
  var ret = function(path) {
    return activeNamespaceSvc.formatNamespaceRoute(path);
  };

  // Because formatNamespaceRoute is stateful, this filter is
  // stateful. If this flag isn't present, Angular will cache the
  // filter results and navigation won't work.
  ret.$stateful = true;

  return ret;
});