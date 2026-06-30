# PageHeader

A page-level header component that displays a title, description, and optional action element. Supports main and secondary navigation styles.

## Import

```tsx
import { PageHeader } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | **Required.** Page title text. Rendered as an `<h1>`. |
| `description` | `string` | — | **Required.** Descriptive text below the title. |
| `action` | `React.ReactNode` | — | Optional action element (typically a Button or Icon button) positioned at the start or end. |
| `actionPosition` | `'start' \| 'end'` | `'end'` | Where the action element is placed relative to the header content. |
| `navigation` | `'main' \| 'secondary'` | `'main'` | Header style. `'main'` uses `headline.medium` for the primary plugin page. `'secondary'` uses `headline.small` for sub-pages like settings. |

## Usage

### Main page header

```tsx
<PageHeader
  title="My Plugin"
  description="A brief description of what this plugin does."
/>
```

### Secondary page header (with back button)

```tsx
<PageHeader
  title="Settings"
  description="Configure plugin preferences."
  navigation="secondary"
  action={<Button label="Back" icon="arrow-left" iconPosition="only" emphasis="tertiary" onClick={handleBack} />}
  actionPosition="start"
/>
```

### With end action

```tsx
<PageHeader
  title="Token Manager"
  description="Browse and apply design tokens."
  action={<Button label="Refresh" icon="levels" iconPosition="only" emphasis="tertiary" onClick={handleRefresh} />}
  actionPosition="end"
/>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `navigation="main"` for the plugin's primary page. | Don't use `navigation="main"` on secondary/settings pages — use `"secondary"`. |
| Place a back button at `actionPosition="start"` on secondary pages. | Don't put multiple action elements in the `action` prop — use a single element. |
| Keep descriptions short (one sentence). | Don't omit the `description` — it provides context for the page. |
| Use `PageHeader` from the templates in `src/design-system/templates/`. | Don't build custom page headers — use this component. |

## Accessibility

- The title renders as an `<h1>` element for proper document outline.
- The description renders as a `<p>` via the `Type` component.
- Action elements should have their own accessible labels (handled by Button's `label` prop or `aria-label`).
