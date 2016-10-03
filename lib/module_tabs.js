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
  sheet.addRule('tabs-list-tab', 'cursor: pointer; position: relative; flex-grow: 1; flex-shrink: 1; flex-basis: 0; margin: 0 0.25em 0 0.25em; padding: 0.1em; text-align: center; border: 1px outset rgba(196, 196, 32, 0.25); background-color: rgba(196, 196, 32, 0.25)');
  sheet.addRule('tabs-content', 'position: relative; flex-grow: 1; flex-shrink: 1; flex-basis: 0; overflow: auto; box-sizing: border-box; border: 1px solid rgba(196, 196, 32, 0.1); display: flex; align-items: stretch; align-contents: stretch;');
  sheet.addRule('tab', 'position: relative; flex-grow: 1; flex-shrink: 1; flex-basis: 0; display: flex;');
  sheet.addRule('tabs-list-tab.selected', 'font-weight: 600; border: 1px inset rgba(196, 196, 32, 0.25); background-color: rgba(196, 196, 32, 0.1)');
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
