# PageFooter

A page-level footer that displays builder attribution and a last-updated date, spanning the full width of its container.

## Import

```tsx
import { PageFooter } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `builderName` | `string` | — | **Required.** The name of the person who built the plugin. |
| `builderSlack` | `string` | — | Optional Slack profile URL. When provided, the name renders as a clickable `Link`. |
| `updatedDate` | `string` | — | **Required.** The date the plugin was last updated, displayed as-is (use MM.DD.YYYY format). |
| `className` | `string` | — | Additional CSS class on the root `<footer>` element. |

## Usage

### Basic (no link)

```tsx
<PageFooter builderName="Nick" updatedDate="04.21.2026" />
```

Renders: *Built by @Nick for Affirm • Updated: 04.21.2026*

### With Slack link

```tsx
<PageFooter
  builderName="Nick"
  builderSlack="https://affirm.slack.com/team/U12345"
  updatedDate="04.21.2026"
/>
```

Renders: *Built by @[Nick](https://affirm.slack.com/team/U12345) for Affirm • Updated: 04.21.2026*

### With custom class

```tsx
<PageFooter
  builderName="Nick"
  updatedDate="04.21.2026"
  className="my-app-footer"
/>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Pass a pre-formatted date string in MM.DD.YYYY format to `updatedDate`. | Don't pass a raw `Date` object — the component renders the string as-is. |
| Use `builderSlack` for a full URL (e.g., Slack profile link). | Don't pass just a Slack handle — provide the complete URL so the `Link` works. |
| Place `PageFooter` as the last element in your page layout. | Don't nest it inside a narrow container — it's designed to span full width. |
| Omit `builderSlack` when no link is needed. | Don't pass an empty string to `builderSlack` — omit the prop entirely. |

## Accessibility

- Renders a semantic `<footer>` element, which carries an implicit `role="contentinfo"`.
- When `builderSlack` is provided, the builder name is a focusable `Link` reachable via keyboard.
- No additional ARIA attributes are required from the consumer.
