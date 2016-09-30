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
// load our default modules

var boxr_module = (function() {
  var sheet = prependStyleSheet();
  sheet.addRule('.boxr-box', 'position: relative; flex-grow: 1; flex-basis: 0; width: 100%; min-height: 100%; display: flex; align-items: stretch; align-content: stretch;');
  sheet.addRule('.boxr-hbox', 'position: relative; flex-grow: 1; flex-basis: 0; width: 100%; min-height: 100%; display: flex; align-items: stretch; align-content: stretch; flex-direction: column;');
  sheet.addRule('.boxr-vbox', 'position: relative; flex-grow: 1; flex-basis: 0; width: 100%; min-height: 100%; display: flex; align-items: stretch; align-content: stretch; flex-direction: row;');
  sheet.addRule('grip', 'position: absolute; display: block; width: 4px; height: 4px; border: 1px solid rgba(96, 32, 96, 0.5); cursor: move;z-index:100; background-color: white;');
  sheet.addRule('.boxr-grip-up', 'top: -4px; left: 50%; width:8px;');
  sheet.addRule('.boxr-grip-down', 'bottom: -4px; left: 50%; width:8px;');
  sheet.addRule('.boxr-grip-left', 'left: -4px; top: 50%; height:8px;');
  sheet.addRule('.boxr-grip-right', 'right: -4px; top: 50%; height:8px;');

  function handleBox(el) {
    if (!el.className) {
      el.className = 'boxr-box';
    }
    // override default styling with provided element attributes
    for (attr_i in el.attributes) {
      if (el.attributes.hasOwnProperty(attr_i)) {
        var attr = el.attributes[attr_i];
        if (attr.name == 'size') {
          //el.style.flexShrink = attr.value;
          el.style.flexGrow = attr.value;
        } else if (attr.name == 'min') {
          el.style.flexShrink = attr.value;
        } else if (attr.name == 'max') {
          el.style.flexGrow = attr.value;
        } else if (attr.name == 'grip') {
          // now we create our magical resize grips
          var grips = attr.value.split(',');
          for (i in grips) {
            var grip = document.createElement('grip');
            var grip_box = grip.getBoundingClientRect();
            grip.className = 'boxr-grip-'+grips[i];
            el.appendChild(grip);
          }
        }
      }
    }
  }
  function handleVBox(el) {
    handleBox(el);
    el.style.flexDirection = 'column';
    el.className = 'boxr-vbox';
  }
  function handleHBox(el) {
    handleBox(el);
    el.style.flexDirection = 'row';
    el.className = 'boxr-hbox';
  }
  function handleGrip(grip) {
    var style = window.getComputedStyle(grip);

    var cl_parts = grip.className.split('-');
    var type = cl_parts[cl_parts.length-1];

    grip.addEventListener('mousedown', function(e) {
      e.preventDefault();
      if (e.which != 1) return;
      var cl_parts = grip.className.split('-');
      var type = cl_parts[cl_parts.length-1];
      if (type == 'up' || type == 'down') {
        document.body.style.cursor = 'row-resize';
      } else if (type == 'left' || type == 'right') {
        document.body.style.cursor = 'col-resize';
      }
      grip.style.cursor = '';

      var start_x = e.x;
      var start_y = e.y;
      var end_x = e.x;
      var end_y = e.y;
      function mouseMove(e) {
        end_x = e.x;
        end_y = e.y;

        var p_children = [].slice.call(grip.parentNode.parentNode.children);

        var flex_total = 0;
        for (var i = 0; i < p_children.length; i++) {
          if (p_children[i].tagName != 'BOX' && p_children[i].tagName != 'VBOX' && p_children[i].tagName != 'HBOX') continue;
          flex_total += parseFloat(p_children[i].style.flexGrow);
        }
        var flex_diff = 100/(flex_total / parseFloat(grip.parentNode.style.flexGrow));

        var prev = p_children[p_children.indexOf(grip.parentNode)-1];
        if (prev && (prev.tagName != 'BOX' && prev.tagName != 'VBOX' && prev.tagName != 'HBOX')) prev = null;
        var next = p_children[p_children.indexOf(grip.parentNode)+1];
        if (next && (next.tagName != 'BOX' && next.tagName != 'VBOX' && next.tagName != 'HBOX')) next = null;
        var box = grip.parentNode.parentNode.getBoundingClientRect();
        if (type == 'up') {
          if (!prev) return;
          var move_diff = ((start_y - end_y) / box.height) * 100;
          var flex_move_diff = (flex_diff + move_diff);

          var flex_change = (flex_move_diff / 100) * flex_total;

          prev.style.flexGrow -= flex_change - parseFloat(grip.parentNode.style.flexGrow);
          grip.parentNode.style.flexGrow = flex_change;
        } else if (type == 'down') {
          if (!next) return;
          var move_diff = ((end_y - start_y) / box.height) * 100;
          var flex_move_diff = (flex_diff + move_diff);

          var flex_change = (flex_move_diff / 100) * flex_total;

          next.style.flexGrow -= flex_change - parseFloat(grip.parentNode.style.flexGrow);
          grip.parentNode.style.flexGrow = flex_change;
        } else if (type == 'left') {
          if (!prev) return;
          var move_diff = ((start_x - end_x) / box.width) * 100;
          var flex_move_diff = (flex_diff + move_diff);

          var flex_change = (flex_move_diff / 100) * flex_total;

          prev.style.flexGrow -= flex_change - parseFloat(grip.parentNode.style.flexGrow);
          grip.parentNode.style.flexGrow = flex_change;
        } else if (type == 'right') {
          if (!next) return;
          var move_diff = ((end_x - start_x) / box.width) * 100;
          var flex_move_diff = (flex_diff + move_diff);

          var flex_change = (flex_move_diff / 100) * flex_total;

          next.style.flexGrow -= flex_change - parseFloat(grip.parentNode.style.flexGrow);
          grip.parentNode.style.flexGrow = flex_change;
        }
        start_x = e.x;
        start_y = e.y;
      }
      function mouseUp(e) {
        if (e.which != 1) return;
        grip.style.cursor = 'move';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
      }
      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    });
  }

  return {
    name: 'Boxr',
    vers: 0.1,
    dom_handlers: {
      'box': handleBox,
      'vbox': handleVBox,
      'hbox': handleHBox,
      'grip': handleGrip
    }
  }
})();

/*
tabs {
  tabs-list { (Tab x or tab->name) }
  tabs-content { (content of tab) }
}
*/
var tabs_module = (function() {
  var sheet = prependStyleSheet();
  sheet.addRule('tabs', 'position: relative; display: flex; flex-direction: column; align-items: stretch; align-content: stretch; width: 100%; min-height: 100%; ');
  sheet.addRule('tabs-list', 'position: relative; display: flex; flex-direction: row; align-items: stretch; align-contents: stretch;');
  sheet.addRule('tabs-list-tab', 'cursor: pointer; position: relative; flex-grow: 1; flex-shrink: 1; flex-basis: 0; margin: 0 0.25em 0 0.25em; padding: 0.1em; text-align: center; border: 1px outset rgba(96, 32, 96, 0.5);');
  sheet.addRule('tabs-content', 'position: relative; flex-grow: 1; flex-shrink: 1; flex-basis: 0; overflow: auto; box-sizing: border-box; border: 1px outset rgba(196, 196, 32, 0.25); display: flex; align-items: stretch; align-contents: stretch;');
  sheet.addRule('tab', 'position: relative; flex-grow: 1; flex-shrink: 1; flex-basis: 0; display: flex;');
  sheet.addRule('tabs-list-tab.selected', 'font-weight: 600; border: 1px inset rgba(96, 32, 96, 0.5); border-width: 1px 1px 0 1px;');
  function handleTabs(el) {
    var list = document.createElement('tabs-list');
    var content = document.createElement('tabs-content');
    el.appendChild(list);
    el.appendChild(content);
  }
  function handleList(el) {
    el.className = 'tabs-list';
  }
  function handleContent(el) {
    el.className = 'tabs-content';
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
  function handleTab(el) {
    var tabs;
    var tabs_content;
    var tabs_list;
    if (el.parentNode.tagName != 'TABS') return;
    tabs = el.parentNode;
    // add this 'tab' to 'tabs-content'
    if (!(tabs_content = findTagWithParent('tabs-content', tabs))) return;
    tabs_content.appendChild(el);
    el.style.display = 'none';
    // create a new 'tabs-list-tab' and add to 'tabs-list'
    if (!(tabs_list = findTagWithParent('tabs-list', tabs))) return;
    var tabs_list_tab = document.createElement('tabs-list-tab');
    tabs_list_tab.innerHTML = 'Tab ' + tabs_list.children.length;
    for (attr_i in el.attributes) {
      if (el.attributes.hasOwnProperty(attr_i)) {
        var attr = el.attributes[attr_i];
        if (attr.name == 'name') {
          tabs_list_tab.innerHTML = attr.value;
        }
      }
    }
    tabs_list.appendChild(tabs_list_tab);
    // set up click hooks for 'tabs-list-tab'
    tabs_list_tab.addEventListener('click', function(e) {
      for (var i = 0; i < tabs_list.children.length; i++) {
        tabs_list.children[i].checked = 'false';
        tabs_list.children[i].className = null;
      }
      tabs_list_tab.checked = 'true';
      tabs_list_tab.className = 'selected';
      // get list of all tabs so we can hide the current selected tab and change our own display
      var tabs = findTagsWithParent('tab', tabs_content);
      console.log(tabs);
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
      }
      // set our tab element to display
      el.style.display = null;
    }, false);
    // emit a click to set the focus to the new tab
    tabs_list_tab.dispatchEvent(new Event('click'));
  }

  return {
    name: 'Tabs',
    vers: 0.1,
    dom_handlers: {
      'tabs': handleTabs,
      'tab': handleTab,
      'tabs-content': handleContent,
      'tabs-list': handleList
    }
  }
})();

jsui.loadModule(tabs_module);
jsui.loadModule(boxr_module);
