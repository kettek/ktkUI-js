var jsui = jsui || {};

jsui.e_handlers = {}; // "vbox": {}
jsui.modules = {};

jsui.doInit = function() {
  for (i in jsui.e_handlers) {
    var elems = document.getElementsByTagName(i);

  }
};

jsui.useModule = function(name) {
};

jsui.modules['boxr'] = {
  'box': {
    'create': function(ele) {
      //ele.style.
    },
    'events': {
      'click': function(e) {
      }
    }
  }
};

window.addEventListener('load', jsui.doInit);
