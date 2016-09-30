# Tabs module
The **Tabs** module provides functionality for creating tabbed content.

## Basic Usage
The basic procedure is to provide a **tags** container with any amount of **tab** elements contained within. Each **tab** element should contain all the content you wish to be contained in the tab.

Example:

    <tabs>
      <tab name="First">
        This is the content of the first tab
      </tab>
      <tab name="Second">
        This is the content of the second tab
      </tab>
    </tabs>

You can dynamically add new tabs by simply using `document.createElement('tab')` and appending that to the **tabs** element. For example:

    var tab = document.createElement('tab');
    tab.name = "My Tab"
    tab.innerText = 'This is the content of a new tab';
    var tabs = document.getElementsByTagName('tabs')[0];
    tabs.appendChild(tab);

