import { Prop, PropList, PropNote } from "./PropTooltip";

export const tooltips = {
  textField: (
    <PropList title="TextField" description="Single-line text input">
      <Prop name="placeholder">Ghost text when empty</Prop>
      <Prop name="startIcon">Icon before the input</Prop>
      <Prop name="isRequired">Marks field as required</Prop>
      <Prop name="isDisabled">Greyed out, not interactive</Prop>
      <Prop name="isReadOnly">Visible but not editable</Prop>
    </PropList>
  ),
  textArea: (
    <PropList title="TextAreaField" description="Multi-line text input">
      <Prop name="placeholder">Ghost text when empty</Prop>
      <Prop name="rows">Number of visible rows</Prop>
      <PropNote>Resizable by the user. Use for notes, descriptions, or long-form content.</PropNote>
    </PropList>
  ),
  numberInteger: (
    <PropList title="NumberField" description="Numeric input with stepper buttons">
      <Prop name="step" value="1">
        Increment per click or key press
      </Prop>
      <Prop name="minValue" value="0">
        Minimum allowed value
      </Prop>
      <Prop name="maxValue" value="100">
        Maximum allowed value
      </Prop>
      <Prop name="allowEmpty">Permits empty field (null value)</Prop>
      <PropNote>Arrow keys and long-press on buttons accelerate over time.</PropNote>
    </PropList>
  ),
  numberDecimal: (
    <PropList title="NumberField" description="Decimal variant with locale formatting">
      <Prop name="step" value="0.1">
        Increment by 0.1
      </Prop>
      <Prop name="decimalPlaces" value="2">
        Always display 2 decimal places
      </Prop>
      <Prop name="minValue" value="0">
        Minimum allowed value
      </Prop>
      <Prop name="maxValue" value="999.99">
        Maximum allowed value
      </Prop>
      <PropNote>Decimal separator adapts to locale (e.g. comma for Danish).</PropNote>
    </PropList>
  ),
  select: (
    <PropList title="SelectField" description="Dropdown for selecting one value">
      <Prop name="items">Options with value, label, and optional icon</Prop>
      <Prop name="value">Currently selected value</Prop>
      <Prop name="onValueChange">Callback when selection changes</Prop>
      <PropNote>Supports icons in both the dropdown items and the collapsed trigger.</PropNote>
    </PropList>
  ),
  multiSelect: (
    <PropList title="MultiSelect" description="Select multiple values from a list">
      <Prop name="items">Items with id, label, and optional icon</Prop>
      <Prop name="value">Array of selected item ids</Prop>
      <Prop name="onChange">Callback with updated id array</Prop>
      <PropNote>Arrow keys navigate options. Tab closes the dropdown.</PropNote>
    </PropList>
  ),
  combobox: (
    <PropList title="ComboboxField" description="Searchable dropdown with type-to-filter">
      <Prop name="items">Filterable options with id, label, icon</Prop>
      <Prop name="emptyMessage">Text shown when filter has no matches</Prop>
      <PropNote>Only allows selecting existing values. Auto-selects on exact text match.</PropNote>
    </PropList>
  ),
  comboboxFreeText: (
    <PropList title="ComboboxField" description="Free text with suggestions">
      <Prop name="allowCustomValue">Accepts values not in the items list</Prop>
      <PropNote>Works like a text input with autocomplete suggestions. Typed value is kept on blur.</PropNote>
    </PropList>
  ),
  comboboxCreatable: (
    <PropList title="ComboboxField" description="Creatable with explicit add option">
      <Prop name="allowCreate">Shows a Create option for new values</Prop>
      <Prop name="onCreateItem">Callback when a new item is created</Prop>
      <PropNote>Use when new options should be explicitly added to the list.</PropNote>
    </PropList>
  ),
  dateField: (
    <PropList title="DateField" description="Native browser date input">
      <Prop name="min / max">Restrict selectable date range</Prop>
      <PropNote>Uses the browser's built-in date picker UI. Format follows browser locale.</PropNote>
    </PropList>
  ),
  datePicker: (
    <PropList title="DatePicker" description="Custom calendar popup for selecting a date">
      <Prop name="value / onChange">Controlled date as YYYY-MM-DD string</Prop>
      <Prop name="min / max">Restrict selectable range</Prop>
      <Prop name="showDropdowns">Month/year dropdown navigation</Prop>
      <PropNote>Shows full date format. Clearable with X button.</PropNote>
    </PropList>
  ),
  dateRange: (
    <PropList title="DateRangePicker" description="Select a start and end date">
      <Prop name="value">Object with start and end Date</Prop>
      <Prop name="onChange">Callback with DateRangeValue or null</Prop>
      <PropNote>Two clicks select the range. Clearable with X button.</PropNote>
    </PropList>
  ),
  timeField: (
    <PropList title="TimeField" description="Native browser time input">
      <Prop name="value / onChange">Time as HH:MM string</Prop>
      <Prop name="trailingContent">Icon or content after the input</Prop>
      <PropNote>Uses the browser's built-in time picker.</PropNote>
    </PropList>
  ),
  switchField: (
    <PropList title="SwitchField" description="Toggle for on/off settings">
      <Prop name="checked / onCheckedChange">Controlled toggle state</Prop>
      <Prop name="isReadOnly">Visible but not toggleable</Prop>
    </PropList>
  ),
  checkboxField: (
    <PropList title="CheckboxField" description="Tick box for boolean choices">
      <Prop name="checked / onCheckedChange">Controlled check state</Prop>
      <Prop name="isReadOnly">Visible but not checkable</Prop>
    </PropList>
  ),
  radioGroup: (
    <PropList title="RadioGroupField" description="Choose one from a small set">
      <Prop name="defaultValue">Initially selected option</Prop>
      <Prop name="isReadOnly">Visible but not changeable</Prop>
      <PropNote>Use for 2-5 mutually exclusive options. For more, use Select.</PropNote>
    </PropList>
  ),
  toggleGroup: (
    <PropList title="ToggleGroup" description="Segmented button group for exclusive or multi-select options">
      <Prop name="variant">Visual style: default or outline</Prop>
      <Prop name="value">Controlled pressed state as array of values</Prop>
      <PropNote>Use for toggling between a small set of options like view modes or text formatting.</PropNote>
    </PropList>
  )
};
