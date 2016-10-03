#!/bin/bash

if [ -z "$1" ]
then
  echo "Usage: $0 module_a module_b"
else
  FILES=()
  for var in "$@"
  do
    FILE="lib/module_$var.js"
    if ! [ -f $FILE ]
    then
      echo "Module '$var' does not exist, not including"
    else
      FILES+=("$FILE")
    fi
  done
  cp lib/jsui.js jsui.js
  for FILE in "${FILES[@]}"
  do
    cat "$FILE" >> jsui.js
  done
fi
