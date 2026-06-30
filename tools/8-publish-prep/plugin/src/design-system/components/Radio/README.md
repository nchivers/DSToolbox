# Radio

A single radio button for selecting one option from a mutually exclusive group.

## Import

```tsx
import { Radio } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible text label displayed next to the indicator. |
| `checked` | `boolean` | — | Controlled checked state. When provided, the component is controlled. |
| `defaultChecked` | `boolean` | `false` | Initial checked state for uncontrolled usage. |
| `disabled` | `boolean` | `false` | Disables interaction and applies disabled styling. |
| `error` | `boolean` | `false` | Applies error styling to the indicator and border. |
| `name` | `string` | — | Groups radios together so only one in the group can be selected. |
| `value` | `string` | — | The value submitted with the form when this radio is selected. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | — | Called when the radio selection changes. |

## Usage

### Basic (uncontrolled)

```tsx
<Radio label="Option A" name="demo" value="a" />
<Radio label="Option B" name="demo" value="b" />
```

### Controlled radio group

```tsx
const [selected, setSelected] = React.useState('a');

<Radio
  label="Option A"
  name="group"
  value="a"
  checked={selected === 'a'}
  onChange={() => setSelected('a')}
/>
<Radio
  label="Option B"
  name="group"
  value="b"
  checked={selected === 'b'}
  onChange={() => setSelected('b')}
/>
```

### Error state

```tsx
<Radio label="Invalid choice" error />
```

### Disabled

```tsx
<Radio label="Unavailable" disabled />
<Radio label="Locked selection" checked disabled />
```

### Without label

```tsx
<Radio name="icon-group" value="star" aria-label="Star rating" />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use the `name` prop to group related radios together. | Don't render a single `Radio` without a group — use `Checkbox` for standalone toggles. |
| Use `label` for visible text. | Don't render text as `children` — this component does not accept `children`. |
| Use `value` to distinguish each radio in a group. | Don't omit `value` when using multiple radios with the same `name`. |
| Use `error` to flag a validation problem on the group. | Don't set `error` without telling the user what went wrong via a separate message. |
| Pass `checked` and `onChange` together for controlled usage. | Don't mix `checked` and `defaultChecked` on the same instance. |
| Provide `aria-label` when rendering without a visible label. | Don't omit both `label` and `aria-label` — the radio must be accessible. |

## Accessibility

- Uses a native `<input type="radio">` for full keyboard and screen reader support.
- The `<label>` wrapper associates the text with the input — clicking the label selects the radio.
- `Tab` moves focus to the group; arrow keys move between radios in the same `name` group (native browser behavior).
- Focus-visible outline appears on keyboard navigation, not on mouse click.
- When rendering without a visible `label`, provide an `aria-label` on the parent or use a wrapping `<fieldset>` with `<legend>` for the group.
