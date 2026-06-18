# DS Publish Prep Export (Figma plugin)

Standalone Figma plugin for the DS Toolbox **Publish Prep** tool. It serializes a
library's publishable surface (variables + styles) to JSON so the
`library_diff.py` script can diff the current working state against the
last-published state.

This plugin is independent of the `plugin/` "Export Variables to JSON" plugin and
shares no build config, so the two will not conflict.

## Modes

- **Export Current** — run with the library file (or a branch) open. Reads
  **local** variables and styles, reflecting pending unpublished edits. Paste the
  result into `inputs/library-current.json`.
- **Export Baseline** — run with a **Baselining File** open (a file that subscribes
  to the published DS library). Reads **remote** (last-published) variables via the
  `teamLibrary` API, and **remote styles** by listing published style keys through
  the Figma REST API (`GET /v1/files/:key/styles`) and importing each by key. Paste
  the result into `inputs/library-baseline.json`.

  Baseline export requires: the library's **main** file key/URL (not a branch) and a
  **Figma personal access token** with `library_content:read` + `files:read`.

## Setup

```bash
cd tools/8-publish-prep/plugin
npm install
```

## Build

```bash
npm run build   # production: dist/code.js + inlined dist/ui.html
npm run dev     # watch mode
```

## Install in Figma

1. **Plugins → Development → Import plugin from manifest…**
2. Select `tools/8-publish-prep/plugin/manifest.json`.
3. For baseline export, the Baselining File must have the published DS library
   enabled via **Assets → Libraries** (the teamLibrary API only sees UI-enabled
   libraries).

## Output shape

```json
{
  "schemaVersion": 1,
  "source": "current | baseline",
  "exportedAt": "ISO-8601",
  "libraryName": "(baseline only, optional)",
  "variables": [
    {
      "id": "...", "key": "...", "name": "color/...", "collection": "...",
      "resolvedType": "COLOR|FLOAT|STRING|BOOLEAN",
      "valuesByMode": { "<modeId>": { "modeName": "...", "value": ... } },
      "hiddenFromPublishing": false, "scopes": ["..."]
    }
  ],
  "styles": [
    { "id": "...", "key": "...", "name": "...", "type": "PAINT|TEXT|EFFECT|GRID", "...": "type-specific props" }
  ]
}
```
