# Export Variables to JSON (Figma plugin)

Figma plugin that exports variable information from the current file (e.g. a library file) to JSON. Built with React, TypeScript, SCSS, and the Affirm design system.

## Exported fields

For each variable, the JSON includes:

- **id** – variable ID
- **name** – variable name
- **collection** – name of the variable collection it belongs to
- **resolvedType** – `"BOOLEAN"` | `"COLOR"` | `"FLOAT"` | `"STRING"`
- **valuesByMode** – map of mode ID → `{ modeName, value }` (primitives, `{ r, g, b }` / `{ r, g, b, a }`, or `{ type: "VARIABLE_ALIAS", id: "...", name?: "..." }`)
- **hiddenFromPublishing** – boolean
- **scopes** – array of `VariableScope` strings (e.g. `"ALL_SCOPES"`, `"TEXT_CONTENT"`, `"FILL"`, …)

## Setup

```bash
cd plugin
npm install
```

## Development

```bash
npm run dev
```

Builds in watch mode. Load the plugin in Figma from `manifest.json`.

## Production build

```bash
npm run build
```

Outputs `dist/code.js` and `dist/ui.html`.

## How to run in Figma

1. In Figma: **Plugins** → **Development** → **Import plugin from manifest…**
2. Select the **manifest.json** file in this folder.
3. Open a file that has local variables (e.g. your library file).
4. Run **Plugins** → **Development** → **Export Variables to JSON**.
5. Click **Export variables**, then **Copy JSON**.

## Files

- **manifest.json** – plugin manifest
- **src/code.ts** – plugin sandbox logic (reads variables, sends JSON to UI)
- **src/ui.tsx** – React UI (export button, JSON preview, copy)
- **src/ui.scss** – custom layout styles
- **src/design-system/** – Affirm design system (components, tokens, theme)
- **webpack.config.js** – build configuration
- **dist/** – build output (git-ignored)
