var boxr_module = (function() {
  var sheet = prependStyleSheet();
  sheet.addRule('.boxr-box', 'position: relative; flex-grow: 1; flex-basis: 0; display: flex; align-items: stretch; align-content: stretch;');
  sheet.addRule('.boxr-hbox', 'position: relative; flex-grow: 1; flex-basis: 0; width: 100%; min-height: 100%; display: flex; align-items: stretch; align-content: stretch; flex-direction: column;');
  sheet.addRule('.boxr-vbox', 'position: relative; flex-grow: 1; flex-basis: 0; width: 100%; min-height: 100%; display: flex; align-items: stretch; align-content: stretch; flex-direction: row;');
  sheet.addRule('grip', 'position: absolute; display: block; width: 4px; height: 4px; border: 1px solid rgba(128, 128, 196, 0.5); cursor: move;z-index:100; background-color: white;');
  sheet.addRule('.boxr-grip-up', 'top: -4px; left: 50%; margin-left: -4px; width:8px;');
  sheet.addRule('.boxr-grip-down', 'bottom: -4px; left: 50%; margin-left: -4px; width:8px;');
  sheet.addRule('.boxr-grip-left', 'left: -4px; top: 50%; margin-top: -4px; height:8px;');
  sheet.addRule('.boxr-grip-right', 'right: -4px; top: 50%; margin-top: -4px; height:8px;');
  sheet.addRule('.boxr-vbox', 'box-sizing: border-box; border: 1px solid rgba(128, 128, 196, 0.1); background-color: rgba(128, 128, 196, 0.1)');
  sheet.addRule('.boxr-vbox, .boxr-hbox, .boxr-box', 'border-right: 1px solid rgba(160, 160, 196, 0.5); border-bottom: 1px solid rgba(160, 160, 196, 0.5);');

  function handleBox(el) {
    if (!el.className) {
      el.className = 'boxr-box';
    }
    el.style.flexGrow = 1;
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

      var start_x = e.clientX;
      var start_y = e.clientY;
      var end_x = e.clientX;
      var end_y = e.clientY;
      function mouseMove(e) {
        end_x = e.clientX;
        end_y = e.clientY;

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
        start_x = e.clientX;
        start_y = e.clientY;
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
