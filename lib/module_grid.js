var grid_module = (function() {
  var sheet = prependStyleSheet();
  sheet.addRule('grid', 'box-sizing: border-box; position: relative; border: 1px solid rgba(196, 196, 32, 0.1); background-color: rgba(196, 196, 128, 0.01)');
  sheet.addRule('grid table', 'border-collapse: collapse');
  sheet.addRule('grid td', 'position: relative; border: 1px solid rgba(196, 196, 196, 0.9)');
  sheet.addRule('grid', 'transform-origin: 0 0; cursor: crosshair;');
  sheet.addRule('grid-cell', 'position: absolute; left: 0; top: 0');
  sheet.addRule('grid td:hover:before', 'display: block; content: ""; position: absolute; left: 0; top: 0; bottom: 0; right: 0; background: rgba(0,128,128, 0.5);');
  sheet.addRule('grid td:before', 'background: rgba(0,128,128,0);');
  function handleGrid(el) {
    var el_table = document.createElement('table');
    var rows = 0;
    var cols = 0;
    var cwidth = 8, cheight = 8;
    for (attr_i in el.attributes) {
      if (el.attributes.hasOwnProperty(attr_i)) {
        var attr = el.attributes[attr_i];
        if (attr.name == 'rows') {
          rows = Number(attr.value);
        } else if (attr.name == 'cols') {
          cols = Number(attr.value);
        } else if (attr.name == 'cellwidth') {
          cwidth = Number(attr.value);
        } else if (attr.name == 'cellheight') {
          cheight = Number(attr.value);
        }
      }
    }
    for (var y = 0; y < rows; y++) {
      var el_row = document.createElement('tr');
      el_row.style.height = cheight+'px';
      for (var x = 0; x < cols; x++) {
        var el_cell = document.createElement('td');
        el_cell.style.width = cwidth+'px';
        el_cell.style.height = cheight+'px';
        el_cell.addEventListener('click', (function(x, y, cell) {return function(e) {
          e.preventDefault();
          var event = new Event('cell-click');
          event.cell = cell;
          event.x = x;
          event.y = y;
          el.dispatchEvent(event);
        }})(x, y, el_cell), false);
        var el_content = document.createElement('grid-cell');
        el_cell.appendChild(el_content);
        el_row.appendChild(el_cell);
      }
      el_table.appendChild(el_row);
    }
    el.appendChild(el_table);
  }

  return {
    name: 'Grid',
    vers: 0.1,
    dom_handlers: {
      'grid': handleGrid
    }
  }
})();

jsui.loadModule(grid_module);
