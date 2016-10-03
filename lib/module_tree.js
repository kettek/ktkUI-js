var tree_module = (function() {
  var sheet = prependStyleSheet();
  sheet.addRule('tree, tree-branches, tree-head, tree-head-text, tree-btn-hide, branch', 'box-sizing: border-box;');
  sheet.addRule('tree', 'position: relative; display: block; border:1px solid blue;');
  sheet.addRule('tree-branches', 'display: inline-block; margin-left: 1em; width: 100%;');
  sheet.addRule('tree-head', 'position: relative; display: block; height: 100%; border: 1px dashed blue;');
  sheet.addRule('tree-head-text', 'position: relative;');
  sheet.addRule('tree-btn-hide', 'position: relative; display: inline-block; width: 0.5em; height: 0.5em; border: 1px solid black;');
  sheet.addRule('branch', 'display: flex; border-bottom: 1px solid red;');

  function handleTree(ele) {
    var tree_head = document.createElement('tree-head');
    var tree_head_text = document.createElement('tree-head-text');
    var branches = document.createElement('tree-branches');
    tree_head.appendChild(tree_head_text);
    ele.insertBefore(branches, ele.firstChild);
    ele.insertBefore(tree_head, ele.firstChild);

    for (attr_i in ele.attributes) {
      if (ele.attributes.hasOwnProperty(attr_i)) {
        var attr = ele.attributes[attr_i];
        if (attr.name == 'name') {
          tree_head_text.innerHTML = attr.value;
        }
      }
    }
  }

  function handleBranch(ele) {
    var tree;
    var branches;
    if (ele.parentNode.tagName !== 'TREE') return;
    tree = ele.parentNode;
    // move branch to containing parent's `branches` element
    if (!(branches = findTagWithParent('tree-branches', tree))) return;
    branches.appendChild(ele);
    var tree_head = findTagWithParent('tree-head', tree);
    if (tree_head && !(findTagWithParent('tree-btn-hide', tree_head))) {
      var hide_btn = document.createElement('tree-btn-hide');
      tree_head.insertBefore(hide_btn, tree_head.firstChild);
      tree_head.addEventListener('click', function(e) {
        e.preventDefault();
        var branches = findTagWithParent('tree-branches', tree_head.parentNode);
        if (branches.style.display == 'none') {
          branches.style.display = null;
        } else {
          branches.style.display = 'none';
        }
      }, false);
    }
  }

  return {
    name: 'Tree',
    vers: 0.1,
    dom_handlers: {
      "tree": handleTree,
      "branch": handleBranch
    }
  }

})();

jsui.loadModule(tree_module);
