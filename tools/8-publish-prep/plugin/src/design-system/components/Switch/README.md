# Switch

A themed toggle switch with label, controlled/uncontrolled support, label positioning, and error state.

## Import

```tsx
import { Switch } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `React.ReactNode` | — | **Required.** Label text or element for the switch. |
| `checked` | `boolean` | — | Controlled checked state. When provided, the component is controlled. |
| `defaultChecked` | `boolean` | `false` | Initial checked state for uncontrolled usage. |
| `disabled` | `boolean` | `false` | Disables interaction and applies disabled styling. |
| `error` | `boolean` | `false` | Applies error styling to the switch track. |
| `hideLabel` | `boolean` | `false` | Visually hides the label (still accessible to screen readers). |
| `labelPosition` | `'end' \| 'start'` | `'end'` | Position of the label relative to the switch. `'start'` places the label before the toggle. |
| `name` | `string` | — | Form field name for the hidden input. |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | — | Called when the switch is toggled. |

## Usage

### Basic (uncontrolled)

```tsx
<Switch label="Enable notifications" />
```

### Controlled

```tsx
const [enabled, setEnabled] = React.useState(false);

<Switch
  label="Dark mode"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

### Label at start

```tsx
<Switch label="Auto-save" labelPosition="start" checked={autoSave} onChange={handleToggle} />
```

### Hidden label (icon-only context)

```tsx
<Switch label="Toggle feature" hideLabel checked={on} onChange={handleToggle} />
```

### Error state

```tsx
<Switch label="Required setting" error />
```

### Disabled

```tsx
<Switch label="Locked" disabled />
<Switch label="Locked on" checked disabled />
```

### Inside a Row

```tsx
<Row
  title="Dark mode"
  subtitle={[{ text: 'Toggle dark theme' }]}
  trailingElement={<Switch label="Dark mode" hideLabel checked={isDark} onChange={handleToggle} />}
/>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `checked` + `onChange` for controlled forms, or `defaultChecked` for uncontrolled. | Don't set both `checked` and `defaultChecked` — pick one pattern. |
| Use `hideLabel` when the switch is inside a Row or other labeled context. | Don't remove the `label` prop entirely — it's required for accessibility. |
| Use `labelPosition="start"` for right-aligned switches in settings layouts. | Don't use Switch for multi-option selections — use Checkbox or Radio instead. |

## Accessibility

- Renders a native `<input type="checkbox" role="switch">` inside a `<label>`.
- `aria-checked` reflects the current state for screen readers.
- The checkmark/close icons inside the track are decorative — state is communicated via the input element.
- When `disabled`, the native `disabled` attribute removes the input from the tab order.
- When `hideLabel` is true, the label remains in the DOM for screen readers but is visually hidden.
