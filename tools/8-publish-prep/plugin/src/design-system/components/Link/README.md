# Link

A themed text link component with size variants, external link indicator, and polymorphic rendering (anchor, button, or span).

## Import

```tsx
import { Link } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | Controls font size. |
| `externalLink` | `boolean` | `false` | Shows an external link icon after the text. |
| `disabled` | `boolean` | `false` | Disables the link and removes it from tab order. |
| `as` | `'a' \| 'button' \| 'span'` | `'a'` | HTML element to render. Use `'button'` for action links without a URL. |
| `href` | `string` | — | URL for the link. Only meaningful when `as` is `'a'` (default). |
| `target` | `string` | — | Target attribute for the anchor element. |
| `rel` | `string` | — | Rel attribute for the anchor element. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `children` | `React.ReactNode` | — | Link text content. |

Also accepts all standard HTML attributes for the rendered element.

## Usage

### Basic

```tsx
<Link href="https://example.com">Visit site</Link>
```

### External link (with icon indicator)

```tsx
<Link href="https://docs.example.com" externalLink>Documentation</Link>
```

### Sizes

```tsx
<Link href="/learn-more" size="large">Learn more</Link>
<Link href="/details" size="medium">Details</Link>
<Link href="/footnote" size="small">See footnote</Link>
```

### Action link (no URL)

```tsx
<Link as="button" onClick={handleClick}>Retry action</Link>
```

### Disabled

```tsx
<Link href="/unavailable" disabled>Unavailable</Link>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `as="button"` for links that trigger actions without navigation. | Don't use an anchor with `href="#"` for actions — use `as="button"` instead. |
| Use `externalLink` when the link opens an external site. | Don't manually add external icons inside `children` — use the `externalLink` prop. |
| Use `size` to match the surrounding text scale. | Don't override font sizes with custom CSS — use the `size` prop. |
| Use `disabled` when the link target is temporarily unavailable. | Don't hide links by setting opacity manually — use `disabled` for the proper styling and accessibility. |

## Accessibility

- When `disabled`, `aria-disabled` is set and `tabIndex` is `-1`, removing the link from keyboard navigation.
- The external link icon is `aria-hidden` — screen readers only announce the text content.
- When `as="button"`, renders a semantic `<button>` element for proper keyboard and screen reader support.
