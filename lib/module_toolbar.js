var toolbar_module = (function() {
  var sheet = prependStyleSheet();
  sheet.addRule('toolbar', 'position: relative; display: flex; flex-direction: row; align-items: flex-start; align-content: flex-start; flex-wrap: wrap; width: 100%;');
  sheet.addRule('toolbar > *', 'position: relative; flex-grow: 1; flex-basis: 0;');

  return {
    name: 'Toolbar',
    vers: 0.1
  }
})();

jsui.loadModule(toolbar_module);
