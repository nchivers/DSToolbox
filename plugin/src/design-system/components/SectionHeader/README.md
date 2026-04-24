# SectionHeader

A section header with a bold headline title, an optional body description, and an optional action button, used to label and describe content sections.

## Import

```tsx
import { SectionHeader } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | **Required.** The headline text displayed on the left. |
| `body` | `string` | — | Optional description text displayed below the title row. Renders in body large / text primary style. |
| `actionLabel` | `string` | — | Text label for the action button. When provided, a tertiary `Button` with a disclosure chevron is rendered on the right. |
| `onActionClick` | `(e: React.MouseEvent<HTMLButtonElement>) => void` | — | Click handler for the action button. |
| `className` | `string` | — | Additional CSS class on the root element. |

## Usage

### Basic

```tsx
<SectionHeader title="Recent orders" />
```

### With body text

```tsx
<SectionHeader
  title="Instructions"
  body="General instructions for how to use the plugin."
/>
```

### With an action

```tsx
<SectionHeader
  title="Recent orders"
  actionLabel="See all"
  onActionClick={() => navigateTo('/orders')}
/>
```

### With body and action

```tsx
<SectionHeader
  title="Saved items"
  body="Items you've bookmarked for later."
  actionLabel="View all"
  onActionClick={() => navigateTo('/saved')}
/>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `body` for short descriptive text below the title. | Don't use `body` for long multi-paragraph content — keep it to one or two sentences. |
| Use `actionLabel` to show the CTA — the component renders a correctly styled tertiary button. | Don't try to pass a custom `<Button>` or `<Link>` — the action is not a slot. |
| Use the `title` prop for the headline text. | Don't pass children — this component does not accept `children`. |
| Keep titles short so they don't truncate on narrow viewports. | Don't use this component for page-level headings — use `<PageHeader>` instead. |
| Let the component handle text color and button styling via tokens. | Don't override the title color or button emphasis with custom CSS. |

## Accessibility

- The title renders as an `<h2>` element by default, contributing to the document heading hierarchy.
- If the heading level needs adjustment for your page structure, the `Type` component's `as` prop is used internally — contact the DS team if a different level is needed.
- The action button includes a visible text label and a decorative disclosure icon; no additional `aria-label` is needed.
- The body text renders as a `<p>` element by default, associated with the heading by DOM proximity.
