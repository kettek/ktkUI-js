# Modules
This document briefly describes what a module is and how it interacts with the UI library.

## Structure
The structure of a module is:

  * **name**
    * String identifying the module
  * **vers**
    * Number or String containing the version
  * **dom_handlers**
    * Object containing 'tag'=>function pairs
  * **class_handlers**
    * Object containing 'class name'=>function pairs

## Basic Example
A basic module that sets the text color of all anchor elements would be:

    var my_module = (function(){
      function colorize(ele) {
        ele.style.color = '#ff00ff';
      }

      return {
        name: 'Colorizer',
        vers: 1.0,
        dom_handlers: {
          'a': colorize
        }
      }
    })();

    jsui.loadModule(my_module);

Upon loading, all existing anchor tags and all created tags would have their color set to *#ff00ff*.
