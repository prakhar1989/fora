// Generated by CoffeeScript 1.6.2
(function() {
  var k, modules, v;

  modules = {
    auth: 'Auth',
    home: 'Home',
    forums: 'Forums',
    users: 'Users',
    dev_designs: 'Dev_Designs'
  };

  for (k in modules) {
    v = modules[k];
    exports[v] = require("./" + k)[v];
  }

}).call(this);
