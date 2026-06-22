# Component publish exclusions

Figma lets you hide a component or component set from a library publish via
right-click -> "Hide from publishing" in the Publish dialog. Just like styles
(and unlike variables, which expose `hiddenFromPublishing`), the Figma **Plugin
API does not expose this state for components**, so the "Export Current" plugin
cannot capture it and those components would otherwise show up as
**New (publish-eligible)** in the report.

This file is the workaround: list glob patterns for components/component sets that
should be treated as **not-for-publish**. `library_diff.py` reads the patterns
below and buckets any current component whose full path name matches as *excluded*
instead of *new*. A pattern-matched component that was previously published is
reported as "will be REMOVED on publish."

Keep this list in sync with the components you have hidden from publishing in Figma.

## How matching works

- One glob per line, inside the fenced block below.
- Lines that are blank or start with `#` are ignored (use `#` for comments).
- Matching is `fnmatch`-style and **`*` also spans `/`**, so `wip/*` matches
  `wip/experiment/draft`.
- Patterns are matched against the component's full path name (e.g.
  `deprecated/LegacyButton`), case-sensitive.
- A pattern without a wildcard matches that exact component name.
- The `.`/`_` private-prefix rule is always applied in addition to these patterns
  (a component named `_Internal` or `.Scratch` is excluded automatically).

## Patterns

```text
# One glob per line. * matches any characters including "/".
Color Swatch
Size Swatch
Page Annotation
Change Log Block
Table of Reviews
Reviewer
Reviewer row
Reviewer Status
Owners
Change Designer
State Indicators
Merge and Publish Containers
Info Block - Top
💠 Content Slot
```
