# Checkbox

A themed checkbox input with label, controlled/uncontrolled support, and error state.

## Import

```tsx
import { Checkbox } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `React.ReactNode` | — | **Required.** Label text or element rendered next to the checkbox. |
| `checked` | `boolean` | — | Controlled checked state. When provided, the component is controlled. |
| `defaultChecked` | `boolean` | `false` | Initial checked state for uncontrolled usage. |
| `disabled` | `boolean` | `false` | Disables interaction and applies disabled styling. |
| `error` | `boolean` | `false` | Applies error styling to the indicator. |
| `name` | `string` | — | Form field name for the hidden input. |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | — | Called when the checked state changes. |

## Usage

### Basic (uncontrolled)

```tsx
<Checkbox label="I agree to the terms" />
```

### Controlled

```tsx
const [agreed, setAgreed] = React.useState(false);

<Checkbox
  label="Subscribe to newsletter"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

### With rich label

```tsx
<Checkbox
  label={<span>I accept the <Link href="/terms">Terms of Service</Link></span>}
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>
```

### Error state

```tsx
<Checkbox label="Required field" error />
```

### Disabled

```tsx
<Checkbox label="Cannot change" disabled />
<Checkbox label="Locked selection" checked disabled />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `checked` + `onChange` for controlled forms, or `defaultChecked` for uncontrolled. | Don't set both `checked` and `defaultChecked` — pick one pattern. |
| Use `error` to highlight validation failures. | Don't rely on `error` alone — pair with visible error text in the surrounding form. |
| Pass a `ReactNode` to `label` for rich content like links. | Don't hide the label — it's required for accessibility. |

## Accessibility

- Wraps a native `<input type="checkbox">` inside a `<label>`, so clicking the label toggles the checkbox.
- The checkmark icon inside the indicator is decorative — the native input communicates state to assistive technology.
- When `disabled`, the native `disabled` attribute removes the input from the tab order.
