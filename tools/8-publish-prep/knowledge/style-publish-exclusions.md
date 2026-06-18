# Style publish exclusions

Figma lets you hide a style from a library publish via right-click -> "Hide from
publishing" in the Publish dialog. Unlike variables (`hiddenFromPublishing`), the
Figma **Plugin API does not expose this state for styles**, so the "Export Current"
plugin cannot capture it and those styles would otherwise show up as
**New (publish-eligible)** in the report.

This file is the workaround: list glob patterns for styles that should be treated as
**not-for-publish**. `library_diff.py` reads the patterns below and buckets any current
style whose full path name matches as *excluded* instead of *new*. A pattern-matched
style that was previously published is reported as "will be REMOVED on publish."

Keep this list in sync with the styles you have hidden from publishing in Figma.

## How matching works

- One glob per line, inside the fenced block below.
- Lines that are blank or start with `#` are ignored (use `#` for comments).
- Matching is `fnmatch`-style and **`*` also spans `/`**, so `shadow/button/*` matches
  `shadow/button/primary/composite/resting`.
- Patterns are matched against the style's full path name (e.g.
  `typography/DEPRICATING/-DEP-heroNumber`), case-sensitive.
- A pattern without a wildcard matches that exact style name.

## Patterns

```text
# One glob per line. * matches any characters including "/".
typography/DEPRICATING/*
shadow/button/*
shadow/card_container/*
shadow/modal/*
shadow/tooltip/*
shadow/affirm_card/*
shadow/switch/*
color/slide_button/*
color/skeleton/*
```
