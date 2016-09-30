# boxr module
The **boxr** module provides flex-box functionality via a set of tags.

## Basic Usage

To create a vertically split set of boxes:

    <vbox>
      <box>Up</box>
      <box>Down</box>
    </vbox>

To create a horizontal split set of boxes:

    <hbox>
      <box>Left</box>
      <box>Right</box>
    </hbox>

Boxes may be resized by adding a **grip** attribute with a comma-delimited list of **up**, **down**, **left**, and **right**.

For example:

    <vbox>
      <box>
      </box>
      <box grip="up,down">
      </box>
      <hbox>
        <box grip="right">
        </box>
        <box>
        </box>
      </hbox>
    </vbox>

Finally, boxes may provide the **size**, **max**, or **min** attribute, providing values for flex-grow for size and max and flex-shrink for min.
