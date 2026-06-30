# DS Publish Prep Export (Figma plugin)

Standalone Figma plugin for the DS Toolbox **Publish Prep** tool. It serializes a library's publishable surface (variables, styles, and components) to JSON so the `library_diff.py` script can diff the current working state against the last-published state.

This version was rebuilt on the Affirm Figma Plugin Starter, so its UI uses the Affirm design system (themed components, light/dark mode) while preserving the original export functionality.

## Modes

- **Export Current** — run with the library file (or a branch) open. Reads **local** variables, styles, and components, reflecting pending unpublished edits. Save the result as `inputs/library-current.json`.
- **Export Baseline** — run with a **Baselining File** open (a file that subscribes to the published DS library). Reads **remote** (last-published) variables via the `teamLibrary` API, and **remote styles/components** by listing published keys through the Figma REST API (`GET /v1/files/:key/styles`, `/components`, `/component_sets`) and importing each by key. Save the result as `inputs/library-baseline.json`.

  Baseline export requires: the library's **main** file key/URL (not a branch) and a **Figma personal access token** with `library_content:read` + `files:read`.

## Setup

```
npm install
```

## Build

```
npm run build   # production: dist/code.js + inlined dist/ui.html
npm run dev     # watch mode
```

## Install in Figma

1. **Plugins → Development → Import plugin from manifest…**
2. Select this project's `manifest.json`.
3. For baseline export, the Baselining File must have the published DS library enabled via **Assets → Libraries** (the teamLibrary API only sees UI-enabled libraries).

## Output shape

```jsonc
{
  "schemaVersion": 3,
  "source": "current | baseline",
  "exportedAt": "ISO-8601",
  "libraryName": "(baseline only, optional)",
  "variables": [
    {
      "id": "...", "key": "...", "name": "color/...", "collection": "...",
      "resolvedType": "COLOR|FLOAT|STRING|BOOLEAN",
      "valuesByMode": { "<modeId>": { "modeName": "...", "value": "..." } },
      "hiddenFromPublishing": false, "scopes": ["..."]
    }
  ],
  "styles": [
    { "id": "...", "key": "...", "name": "...", "type": "PAINT|TEXT|EFFECT|GRID" }
  ],
  "components": [
    { "id": "...", "key": "...", "name": "...", "type": "COMPONENT|COMPONENT_SET",
      "componentProperties": {}, "layers": [] }
  ]
}
```

## Architecture

- `src/code.ts` — Figma sandbox: all variable/style/component serialization and the REST + teamLibrary baseline logic.
- `src/ui.tsx` — React UI built with the Affirm design system (`PageHeader`, `Radio`, `Dropdown`, `InputText`, `InputTextArea`, `Button`, `PageFooter`).
- `manifest.json` — plugin config (`teamlibrary` permission, `api.figma.com` network access, `dynamic-page` document access).
