var tree_module = (function() {
  var sheet = prependStyleSheet();
  sheet.addRule('tree', 'box-sizing: border-box; position: relative; display: block; margin-left: 0.25em; background-color: rgba(128, 128, 196, 0.1); border: 1px solid rgba(128, 128, 196, 0.05); border-width: 0 1px 1px 0; width: 100%;');
  sheet.addRule('tree-branches', 'position: relative; box-sizing: border-box; display: flex; flex-direction: column; margin-left: 1em;');
  sheet.addRule('tree-branches:after', 'position: absolute; left: -0.75em; top: 0; display: block; width: 0.5em; height: 0.75em; border-style: solid; border-width: 0 0 1px 1px; border-color: rgba(64, 64, 32, 0.5); content:"";');
  sheet.addRule('tree-head', 'box-sizing: border-box; position: relative; display: block;');
  sheet.addRule('tree-head-text', 'box-sizing: border-box; position: relative; margin-left: 0.5em;');
  sheet.addRule('tree-btn', 'box-sizing: border-box; position: relative; display: inline-block; width: 0.5em; height: 0.5em; border-style: solid');
  sheet.addRule('.tree-btn-show', 'width: 0; height: 0; border-width: 0.25em 0 0.25em 0.5em; border-color: transparent transparent transparent rgba(64, 64, 32, 0.75);');
  sheet.addRule('.tree-btn-hide', 'width: 0; height: 0; border-width: 0.5em 0.25em 0 0.25em; border-color: rgba(64, 64, 32, 0.5) transparent transparent transparent;');
  sheet.addRule('.tree-btn-delete', 'border: 1px solid red;');
  sheet.addRule('branch', 'box-sizing: border-box; display: block; flex-grow: 1;');

  function handleTree(ele) {
    var tree_head = document.createElement('tree-head');
    var tree_head_text = document.createElement('tree-head-text');
    var branches = document.createElement('tree-branches');
    tree_head.appendChild(tree_head_text);
    ele.insertBefore(branches, ele.firstChild);
    ele.insertBefore(tree_head, ele.firstChild);
    // move all non-tree specific children into tree_head
    var children = [].slice.call(ele.childNodes);
    for (var i = 0; i < children.length; i++) {
      if (children[i].tagName !== 'BRANCH' && children[i].tagName !== 'TREE-BRANCHES' && children[i].tagName !== 'TREE-HEAD') {
        tree_head.appendChild(children[i]);
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
    if (tree_head && !(findTagWithParent('tree-btn', tree_head))) {
      var hide_btn = document.createElement('tree-btn');
      hide_btn.className = 'tree-btn-hide';
      tree_head.insertBefore(hide_btn, tree_head.firstChild);
      tree_head.addEventListener('click', function(e) {
        e.preventDefault();
        var branches = findTagWithParent('tree-branches', tree_head.parentNode);
        if (branches.style.display == 'none') {
          branches.style.display = null;
          hide_btn.className = 'tree-btn-hide';
        } else {
          branches.style.display = 'none';
          hide_btn.className = 'tree-btn-show';
        }
      }, false);
      // click the tree if it is supposed to start folded
      if (tree.attributes.folded) tree_head.dispatchEvent(new Event('click'));
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
