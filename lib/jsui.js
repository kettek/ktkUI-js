function prependStyleSheet() {
  var element = document.createElement('style');
  element.type = 'text/css';

  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(element, head.firstChild);
  var sheet = document.styleSheets[0];

  function addRule(selectorText, cssText, index) {
    if (typeof index === 'undefined') index = this.cssRules.length;
    this.insertRule(selectorText + ' {' + cssText + '}', index);
  }
  if (typeof sheet.addRule === 'undefined') sheet.addRule = addRule;
  if (typeof sheet.removeRule === 'undefined') sheet.removeRule = sheet.deleteRule;

  return sheet;
}

function findTagWithParent(tag, parent) {
  var matches = parent.getElementsByTagName(tag);
  for (var i = 0; i < matches.length; i++) {
    if (matches[i].parentNode === parent) return matches[i];
  }
  return null;
}
function findTagsWithParent(tag, parent) {
  var ret = [];
  var matches = parent.getElementsByTagName(tag);
  for (var i = 0; i < matches.length; i++) {
    if (matches[i].parentNode === parent) ret.push(matches[i]);
  }
  return ret;
}

var jsui = jsui || (function() {
  // ******** PRIVATE
  // **** VARIABLES
  var dom_handlers = {};
  var class_handlers = {};
  var modules = {};      // loaded modules

  var observer = null;
  if (MutationObserver) {
    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
          onNewDOM(mutation.addedNodes[i]);
        }
      });
    });
  }

  // **** FUNCTIONS
  function onNewDOM(e) {
    // start observing new DOM
    if (observer) observer.observe(e, {childList: true});
    var tag = e.tagName.toLowerCase();
  }
  function onInit() {
    if (!observer) {
      document.addEventListener('DOMNodeInserted', onNewDOM, false);
    } else {
      var elems = document.getElementsByTagName('*');
      for (var i = 0; i < elems.length; i++) {
        observer.observe(elems[i], {childList: true});
      }
    }

    for (e in dom_handlers) {
      var nodes = document.getElementsByTagName(e);
      // we have to push the NodeList into an array, as the NodeList can change during processing
      var elems = [];
      for (var i = 0; i < nodes.length; i++) elems.push(nodes[i]);
      for (var h = 0; h < dom_handlers[e].length; h++) {
        for (var i = 0; i < elems.length; i++) {
          dom_handlers[e][h](elems[i]);
        }
      }
    }
    for (e in class_handlers) {
      var nodes = document.getElementsByTagName(e);
      var elems = [];
      for (var i = 0; i < nodes.length; i++) elems.push(nodes[i]);
      for (var h = 0; h < class_handlers[e].length; h++) {
        for (var i = 0; i < elems.length; i++) {
          class_handlers[e][h](elems[i]);
        }
      }
    }
  }
  function loadModule(module) {
    if (modules[module.name]) {
      console.log("WARN: " + module.name + " already loaded");
    }
    for (e in module.dom_handlers) {
      if (!dom_handlers[e]) {
        dom_handlers[e] = [];
      }
      dom_handlers[e].push(module.dom_handlers[e]);
    }
    for (e in module.class_handlers) {
      if (!class_handlers[e]) {
        class_handlers[e] = [];
      }
      class_handlers[e].push(module.class_handlers[e]);
    }

    modules[module.name] = module;
  }
  // ******** PUBLIC
  return {
    loadModule: loadModule,
    doInit: onInit
  }
})();
