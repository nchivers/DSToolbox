# Agent Instructions

Read and follow these instructions before doing any work in this repository.

## Project Overview

This is a **Figma plugin starter** built with React, TypeScript, SCSS, and Webpack. It includes a full design system with themed components and tokens.

**Architecture:**

- `src/code.ts` -- Figma plugin sandbox. Runs in Figma's main thread (no DOM). Communicates with the UI via message passing.
- `src/ui.tsx` -- React app rendered inside a Figma plugin iframe. This is where all UI lives.
- `manifest.json` -- Plugin configuration (name, ID, network access, editor types).
- `dist/` -- Build output. The UI script is inlined into `dist/ui.html`.

**Commands:**

- `npm run dev` -- Build in watch mode (development).
- `npm run build` -- Production build.

---

## Design System First

**ALWAYS use existing design system components before writing custom HTML or CSS.** This is the most important rule in this repository.

Follow this decision process for every UI element:

1. **Does a page template exist?** Copy the matching template from `src/design-system/templates/` and customize it. See the "Page Templates" section below.
2. **Does a DS component exist?** Use it directly.
3. **Can you compose DS components?** Combine existing components to build what you need.
4. **Truly need something custom?** Use design system tokens for all visual properties (`var(--affirm-*)`), follow BEM naming (`affirm-<name>`), and read `src/design-system/README.md` for the full token reference.

Never skip to step 4 without confirming steps 1--3 don't apply.

**UX patterns:** Read and follow `src/design-system/UX_PATTERNS.md` for interaction rules (form behavior, error handling, etc.). These patterns override default assumptions about how components should be composed.

---

## Page Templates

**Before building any plugin page layout, start from an existing template.** Copy the appropriate template file and customize it. Never build a page layout from scratch.

Templates live in `src/design-system/templates/`. They are copy-paste starters, not importable components -- copy the file into `src/ui.tsx` or `src/pages/` and modify it in place.

- **Main page** -- Copy `src/design-system/templates/MainTemplate.tsx` into your `src/ui.tsx`. This is the standard layout for every plugin's primary UI: `PageHeader` (main) + `SectionHeader` + content `<section>` + `PageFooter`.
- **Settings page** -- Copy `src/design-system/templates/SettingsTemplate.tsx` into `src/pages/`. This is the standard layout for plugin settings: `PageHeader` (secondary, with back button) + `SectionHeader` + content `<section>` + `PageFooter`.

After copying, replace the placeholder text, wire up your state and message handlers, and add your plugin-specific UI inside the `<section>` slot. Keep the `PageHeader` / `SectionHeader` / `PageFooter` structure intact.

---

## Available Components

Import from `'./design-system/components'` (relative to `src/`). Providers and hooks import from `'./design-system'`.

### Discovering components

1. **Full list of exports:** Read `src/design-system/components/index.ts` for every available component.
2. **Props, usage, and guidelines:** Read `src/design-system/components/<Name>/README.md` for the component you want to use.

### Critical rule: Type for ALL text

Use `<Type>` for ALL text. Never use raw `<h1>`, `<p>`, `<span>` with manual font/color styling.

```tsx
import { Type } from './design-system/components';

<Type variant="headline.large" as="h1">Page Title</Type>
<Type variant="body.medium" color="text.secondary">Description text</Type>
<Type variant="body.small.highImp" color="text.critical">Error message</Type>
```

**Variants:** `headline.xxlarge`, `headline.xlarge`, `headline.large`, `headline.medium`, `headline.small`, `body.xlarge`, `body.large`, `body.medium`, `body.small`, `body.xlarge.highImp`, `body.large.highImp`, `body.medium.highImp`, `body.small.highImp`, `body.support.xlarge.strike`, `body.support.large.strike`, `body.support.medium.strike`, `body.support.small.strike`

**Colors:** `text.primary`, `text.primary.brand`, `text.primary.inverse`, `text.secondary`, `text.secondary.brand`, `text.secondary.inverse`, `text.link`, `text.link.inverse`, `text.critical`, `text.info`, `text.success`, `text.warning` (plus static variants)

---

## ThemeProvider

The app root MUST be wrapped in `<ThemeProvider>`. This is already set up in `src/ui.tsx`:

```tsx
import { ThemeProvider } from './design-system';

ReactDOM.createRoot(document.getElementById('react-page')).render(
  <ThemeProvider defaultTheme="affirm" defaultMode="auto">
    <App />
  </ThemeProvider>
);
```

Do not remove this wrapper. All DS components depend on it for token resolution.

To read or change the active theme/mode from within a component:

```tsx
import { useTheme } from './design-system';

const { theme, mode, setTheme, setMode } = useTheme();
```

---

## Styling Rules for Custom Elements

When you must create custom UI (after confirming no DS component fits):

- **Study a similar component first.** Find the most visually similar existing component in `src/design-system/components/` and read its `.scss` and `_tokens.scss` files. Mirror its token usage, spacing patterns, and BEM structure. For example: card-like containers reference `CardContainer/`, list layouts reference `Row/` and `ListOfRows/`, input-like controls reference `InputText/`.
- **Never hardcode** hex colors, pixel sizes, or font values.
- Use `var(--affirm-color-bg-*)` for backgrounds.
- Use `var(--affirm-color-text-*)` for text colors.
- Use `var(--affirm-color-border-*)` for borders.
- Use `var(--affirm-color-icon-*)` for icon colors.
- Use `var(--affirm-spacing-*)` for spacing.
- Use `var(--affirm-radius-*)` for border radius.
- Follow BEM naming: `.affirm-<component>`, `.affirm-<component>__<element>`, `.affirm-<component>--<modifier>`.
- Read `src/design-system/README.md` for the complete token catalog and architecture guide.

---

## Plugin Communication

The sandbox (`src/code.ts`) and UI (`src/ui.tsx`) communicate via messages:

**UI to sandbox:**
```tsx
parent.postMessage({ pluginMessage: { type: 'my-action', data: { ... } } }, '*');
```

**Sandbox to UI:**
```ts
figma.ui.postMessage({ type: 'response', data: { ... } });
```

**Sandbox receiving from UI:**
```ts
figma.ui.onmessage = (msg) => {
  if (msg.type === 'my-action') {
    // handle it
  }
};
```

**UI receiving from sandbox:**
```tsx
React.useEffect(() => {
  const handler = (event: MessageEvent) => {
    const msg = event.data.pluginMessage;
    if (msg?.type === 'response') {
      // handle it
    }
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}, []);
```

---

## Quick Reference

| Need | Use |
|------|-----|
| New main page | Copy `src/design-system/templates/MainTemplate.tsx` |
| New settings page | Copy `src/design-system/templates/SettingsTemplate.tsx` |
| Any text | `<Type variant="..." color="...">` |
| Any DS component | Read `src/design-system/components/<Name>/README.md` |
| Full component list | Read `src/design-system/components/index.ts` |
| Spacing | `var(--affirm-spacing-*)` in SCSS |
| Colors | `var(--affirm-color-bg-*)`, `var(--affirm-color-text-*)`, etc. |
| Border radius | `var(--affirm-radius-*)` |
| Full token docs | Read `src/design-system/README.md` |
