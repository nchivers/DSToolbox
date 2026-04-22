# Agent Instructions

Read and follow these instructions before doing any work in this repository.

## Project Overview

This is a **Figma plugin** that exports local Figma variables to JSON. It is built with React, TypeScript, SCSS, and Webpack, using the Affirm design system for all UI components.

**Architecture:**

- `src/code.ts` -- Figma plugin sandbox. Runs in Figma's main thread (no DOM). Reads local variables and sends JSON to the UI via message passing.
- `src/ui.tsx` -- React app rendered inside a Figma plugin iframe. Displays export/copy controls and JSON output.
- `manifest.json` -- Plugin configuration (name, ID, network access, editor types).
- `dist/` -- Build output. The UI script is inlined into `dist/ui.html`.

**Commands:**

- `npm run dev` -- Build in watch mode (development).
- `npm run build` -- Production build.

---

## Plugin Functionality

The plugin exports all local variables from the current Figma file to JSON. For each variable, the export includes:

- `id` -- variable ID
- `name` -- variable name
- `collection` -- name of the variable collection
- `resolvedType` -- `"BOOLEAN"` | `"COLOR"` | `"FLOAT"` | `"STRING"`
- `valuesByMode` -- map of mode ID to `{ modeName, value }` (primitives, RGB/RGBA, or variable aliases)
- `hiddenFromPublishing` -- boolean
- `scopes` -- array of `VariableScope` strings

Alias targets (including library/remote variables) are resolved to include their names when possible.

**Message protocol:**

- UI sends `{ type: 'export-variables' }` to sandbox
- Sandbox replies with `{ type: 'export-result', data: [...] }` or `{ type: 'export-error', message: '...' }`

---

## Design System First

**ALWAYS use existing design system components before writing custom HTML or CSS.** This is the most important rule in this repository.

Follow this decision process for every UI element:

1. **Does a DS component exist?** Use it directly.
2. **Can you compose DS components?** Combine existing components to build what you need.
3. **Truly need something custom?** Use design system tokens for all visual properties (`var(--affirm-*)`), follow BEM naming (`affirm-`), and read `src/design-system/README.md` for the full token reference.

Never skip to step 3 without confirming steps 1 and 2 don't apply.

---

## Available Components

Import from `'./design-system/components'` (relative to `src/`). Providers and hooks import from `'./design-system'`.

Components: `Type`, `InputText`, `InputTextArea`, `Checkbox`, `Switch`, `Link`, `Icon`, `Badge`, `Button`, `CircularLoader`, `Dropdown`, `Divider`, `PageHeader`, `PageFooter`.

See the template's component documentation in `src/design-system/README.md` for full prop references.

---

## ThemeProvider

The app root MUST be wrapped in `<ThemeProvider>`. This is set up in `src/ui.tsx`. Do not remove it. All DS components depend on it for token resolution.

---

## Styling Rules for Custom Elements

When you must create custom UI (after confirming no DS component fits):

- **Never hardcode** hex colors, pixel sizes, or font values.
- Use `var(--affirm-color-bg-*)` for backgrounds.
- Use `var(--affirm-color-text-*)` for text colors.
- Use `var(--affirm-color-border-*)` for borders.
- Use `var(--affirm-color-icon-*)` for icon colors.
- Use `var(--affirm-spacing-*)` for spacing.
- Use `var(--affirm-radius-*)` for border radius.
- Follow BEM naming: `.affirm-<block>`, `.affirm-<block>__<element>`, `.affirm-<block>--<modifier>`.

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
