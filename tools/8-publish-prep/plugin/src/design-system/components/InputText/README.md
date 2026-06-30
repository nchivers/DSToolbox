# InputText

A single-line text input with floating label, optional start/end icons, error state, and helper text.

## Import

```tsx
import { InputText } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Floating label text displayed inside the input. |
| `value` | `string` | — | Controlled input value. When provided, the component is controlled. |
| `defaultValue` | `string` | `''` | Initial value for uncontrolled usage. |
| `error` | `boolean` | `false` | Applies error styling and shows `errorMessage`. |
| `errorMessage` | `string` | — | Error text displayed below the input when `error` is `true`. |
| `message` | `string` | — | Helper text displayed below the input when not in error state. |
| `disabled` | `boolean` | `false` | Disables the input. |
| `startIcon` | `React.ReactNode` | — | Icon rendered at the start (left) of the input. |
| `endIcon` | `React.ReactNode` | — | Icon rendered at the end (right) of the input. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `id` | `string` | auto-generated | DOM id for the input element. |

Also accepts all standard `<input>` HTML attributes (except `value` and `defaultValue` which are typed as `string`).

## Usage

### Basic (uncontrolled)

```tsx
<InputText label="Email address" />
```

### Controlled

```tsx
const [email, setEmail] = React.useState('');

<InputText
  label="Email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### With icons

```tsx
<InputText label="Search" startIcon={<Icon name="levels" />} />
<InputText label="Username" endIcon={<Icon name="checkmark-small" color="icon.success" />} />
```

### Error state

```tsx
<InputText
  label="Email"
  value={email}
  error
  errorMessage="Please enter a valid email address"
  onChange={(e) => setEmail(e.target.value)}
/>
```

### With helper text

```tsx
<InputText label="Display name" message="This will be visible to other users" />
```

### Disabled

```tsx
<InputText label="Locked field" value="Cannot edit" disabled />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `value` + `onChange` for controlled forms, or `defaultValue` for uncontrolled. | Don't set both `value` and `defaultValue` — pick one pattern. |
| Pair `error` with `errorMessage` so the user knows what's wrong. | Don't set `error` without providing an `errorMessage`. |
| Use `startIcon` or `endIcon` for contextual icons. | Don't put interactive elements inside the icon slots — they're decorative only. |
| Use `message` for helpful guidance below the field. | Don't use `message` and `errorMessage` simultaneously — error takes priority automatically. |

## Accessibility

- The label is rendered inside a `<label>` element with `htmlFor` pointing to the input's `id`.
- When `error` is `true`, `aria-invalid` is set on the input and the error message renders with `role="alert"`.
- Focus-visible styling only appears on keyboard navigation, not on mouse click.
- When `disabled`, the native `disabled` attribute removes the input from the tab order.
