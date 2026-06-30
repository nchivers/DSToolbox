# InputNumber

A single-line numeric input field with a floating label, optional icons, and validation messaging.

## Import

```tsx
import { InputNumber } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Visible floating label text. |
| `value` | `string` | — | Controlled input value. When provided the component is controlled. |
| `defaultValue` | `string` | — | Initial value for uncontrolled usage. |
| `error` | `boolean` | `false` | Applies error styling to the input and shows `errorMessage`. |
| `errorMessage` | `string` | — | Error text displayed below the input when `error` is `true`. |
| `message` | `string` | — | Helper text displayed below the input (hidden when `error` is `true`). |
| `disabled` | `boolean` | `false` | Disables interaction and applies disabled styling. |
| `startIcon` | `React.ReactNode` | — | Icon rendered at the leading edge of the input. |
| `endIcon` | `React.ReactNode` | — | Icon rendered at the trailing edge of the input. |
| `min` | `number` | — | Minimum allowed numeric value. |
| `max` | `number` | — | Maximum allowed numeric value. |
| `step` | `number` | — | Step increment for the numeric value. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `name` | `string` | — | Form field name attribute. |
| `id` | `string` | — | DOM id for the input element. Auto-generated if omitted. |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | — | Fired when the input value changes. |
| `onFocus` | `(e: React.FocusEvent<HTMLInputElement>) => void` | — | Fired when the input receives focus. |
| `onBlur` | `(e: React.FocusEvent<HTMLInputElement>) => void` | — | Fired when the input loses focus. |

## Usage

### Basic

```tsx
<InputNumber label="Quantity" />
```

### Controlled

```tsx
const [value, setValue] = React.useState('');

<InputNumber
  label="Amount"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Uncontrolled

```tsx
<InputNumber label="Price" defaultValue="100" />
```

### With min, max, and step

```tsx
<InputNumber label="Percentage" min={0} max={100} step={5} />
```

### With icons

```tsx
<InputNumber
  label="Amount"
  startIcon={<Icon name="checkmark-small" />}
/>
```

### Error state

```tsx
<InputNumber
  label="Quantity"
  error
  errorMessage="Must be a positive number"
/>
```

### Helper message

```tsx
<InputNumber label="Tip amount" message="Enter a value between 1 and 100" />
```

### Disabled

```tsx
<InputNumber label="Locked value" value="42" disabled />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use the `label` prop for visible text. | Don't render text as a child — this component does not accept `children`. |
| Use `min`, `max`, and `step` to constrain valid input. | Don't rely solely on client-side constraints — always validate on the server. |
| Pair `error` with `errorMessage` so the user knows what went wrong. | Don't set `error` without providing an `errorMessage`. |
| Use `value` + `onChange` for controlled mode or `defaultValue` for uncontrolled. | Don't set both `value` and `defaultValue` at the same time. |
| Pass `string` values to `value` and `defaultValue`. | Don't pass a `number` type — the component expects strings like InputText. |

## Accessibility

- The native `<input type="number">` provides built-in keyboard increment/decrement with arrow keys.
- The floating `<label>` is associated via `htmlFor`/`id`, giving screen readers a clear accessible name.
- `aria-invalid` is set automatically when `error` is `true`.
- Error messages use `role="alert"` for live-region announcement.
- Focus-visible styling (keyboard ring) uses a JS-driven `data-focus-visible` attribute to distinguish keyboard from pointer focus.
- Native browser spinner buttons are visually hidden for a cleaner design; arrow key stepping still works.
