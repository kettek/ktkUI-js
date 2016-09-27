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
      var elems = document.getElementsByTagName(e);
      for (var h = 0; h < dom_handlers[e].length; h++) {
        for (var i = 0; i < elems.length; i++) {
          dom_handlers[e][h](elems[i]);
        }
      }
    }
    for (e in class_handlers) {
      var elems = document.getElementsByClassName(e);
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
  function handleBox(el) {
    if (!el.className) {
      el.className = 'boxr-box';
    }
    el.style.position = 'relative';
    el.style.flexGrow = 1;
    //el.style.flexShrink = 1;
    el.style.flexBasis = 0;
    el.style.width = '100%';
    el.style.minHeight = '100%';
    el.style.display = 'flex';
    el.style.alignItems = 'stretch';
    el.style.alignContent = 'stretch';
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
            grip.className = 'box-grip-'+grips[i];
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
    grip.style.position = "absolute";
    grip.style.display = 'block';
    grip.style.width = '4px';
    grip.style.height = '4px';
    grip.style.border = '2px solid black';

    var cl_parts = grip.className.split('-');
    var type = cl_parts[cl_parts.length-1];
    if (type == 'up') {
      grip.style.top = '-5px';
      grip.style.left = '50%';
    } else if (type == 'down') {
      grip.style.bottom = '-5px';
      grip.style.left = '50%';
    } else if (type == 'left') {
      grip.style.left = '-5px';
      grip.style.top = '50%';
    } else if (type == 'right') {
      grip.style.right = '-5px';
      grip.style.top = '50%';
    }

    grip.style.cursor = 'move';
    grip.style.position = 'absolute';

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

jsui.loadModule(boxr_module);
