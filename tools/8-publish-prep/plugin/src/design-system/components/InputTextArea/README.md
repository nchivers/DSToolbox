# InputTextArea

A multi-line text input with floating label, optional start/end icons, error state, and helper text. Shares the same API surface as InputText but renders a `<textarea>`.

## Import

```tsx
import { InputTextArea } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Floating label text displayed inside the textarea. |
| `value` | `string` | — | Controlled textarea value. When provided, the component is controlled. |
| `defaultValue` | `string` | `''` | Initial value for uncontrolled usage. |
| `error` | `boolean` | `false` | Applies error styling and shows `errorMessage`. |
| `errorMessage` | `string` | — | Error text displayed below the textarea when `error` is `true`. |
| `message` | `string` | — | Helper text displayed below the textarea when not in error state. |
| `disabled` | `boolean` | `false` | Disables the textarea. |
| `startIcon` | `React.ReactNode` | — | Icon rendered at the start (left) of the textarea. |
| `endIcon` | `React.ReactNode` | — | Icon rendered at the end (right) of the textarea. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `id` | `string` | auto-generated | DOM id for the textarea element. |

Also accepts all standard `<textarea>` HTML attributes (except `value` and `defaultValue` which are typed as `string`).

## Usage

### Basic (uncontrolled)

```tsx
<InputTextArea label="Description" />
```

### Controlled

```tsx
const [desc, setDesc] = React.useState('');

<InputTextArea
  label="Description"
  value={desc}
  onChange={(e) => setDesc(e.target.value)}
/>
```

### With rows

```tsx
<InputTextArea label="Notes" rows={5} />
```

### Error state

```tsx
<InputTextArea
  label="Feedback"
  error
  errorMessage="Please provide at least 10 characters"
/>
```

### With helper text

```tsx
<InputTextArea label="Bio" message="Maximum 500 characters" />
```

### Disabled

```tsx
<InputTextArea label="Read-only content" value="Cannot edit" disabled />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `value` + `onChange` for controlled forms, or `defaultValue` for uncontrolled. | Don't set both `value` and `defaultValue` — pick one pattern. |
| Pair `error` with `errorMessage` so the user knows what's wrong. | Don't set `error` without providing an `errorMessage`. |
| Use `rows` to hint at the expected content length. | Don't use InputTextArea for single-line inputs — use InputText instead. |
| Use `message` for character limits or formatting guidance. | Don't place interactive elements in the icon slots. |

## Accessibility

- The label is rendered inside a `<label>` element with `htmlFor` pointing to the textarea's `id`.
- When `error` is `true`, `aria-invalid` is set on the textarea and the error message renders with `role="alert"`.
- Focus-visible styling only appears on keyboard navigation, not on mouse click.
- When `disabled`, the native `disabled` attribute removes the textarea from the tab order.
