---
name: publish-prep
description: Prepares a Figma design system library for publishing by diffing the current (local) library state against the last-published (remote) state and producing a per-item change report for variables, styles, and components. Use when preparing a library publish, writing library release notes, or determining which published variables/styles/components changed, are new, or were removed since the last publish.
---

# Library Publish Prep

Diff the current working library against the last-published library and produce a
report of what a publish would change: which published variables/styles/components
changed, which are new and publish-eligible, and which would be removed. For
components, "changed" covers both the publishable API surface (component property
definitions, variant options, description) and a curated set of internal layer
visuals (fills, strokes, stroke weight/align, corner radius, padding, item spacing,
alignment, effects, and variable bindings), matched layer-by-layer via name-path.
Layer geometry (x/y/width/height/rotation) is intentionally not diffed.

The heavy lifting (data capture and comparison) is deterministic. A standalone Figma
plugin serializes both snapshots, and `library_diff.py` computes the diff. This skill
runs that script and turns the structured diff into a design-team-facing summary. Do
not eyeball Figma to infer changes - always rely on the script output so results are
consistent run to run.

---

## Inputs

All inputs use fixed paths (workspace root):

| Path | Purpose |
|------|---------|
| `inputs/library-current.json` | **Required.** Output of the "DS Publish Prep Export" plugin in **Export Current** mode, run with the library file or branch open. Local variables + styles + components (pending edits). |
| `inputs/library-baseline.json` | **Required.** Output of the plugin in **Export Baseline** mode, run in a Baselining File that subscribes to the published library. Remote (last-published) variables + styles + components. |
| `inputs/inputs.json` | Optional. If `mainLibraryUrl` is set, it is included in the report for context. |
| `tools/8-publish-prep/knowledge/style-publish-exclusions.md` | Optional. Glob patterns for styles hidden from publishing in Figma (the Plugin API can't capture this for styles). Matching styles are bucketed as not-for-publish instead of new. |
| `tools/8-publish-prep/knowledge/component-publish-exclusions.md` | Optional. Same idea for components/component sets hidden from publishing (the Plugin API can't capture this for components either). Matching components are bucketed as not-for-publish instead of new. |
| `tools/8-publish-prep/knowledge/classification-rules.md` | How items are matched and classified (published vs new, private/hidden exclusions, fields that count as a change). Read it before interpreting results. |

If either snapshot file is missing or empty, stop and tell the user which export they
still need to paste in (see Workflow).

---

## How the snapshots are produced (for reference)

The user runs the plugin twice. Because the component layer data makes the export
large (often several MB), prefer the plugin's **Download JSON** button over Copy and
save the file directly to the input path:

- **Export Current** in the library file or branch -> Download JSON -> save as
  `inputs/library-current.json`.
- **Export Baseline** in a Baselining File (a file subscribed to the published DS
  library); the plugin reads remote variables via the teamLibrary API and remote
  styles + components via the Figma REST API + import-by-key -> Download JSON -> save
  as `inputs/library-baseline.json`.

(Copy still works for small exports, but large outputs should be downloaded - copying
many MB from the plugin's textarea can freeze the plugin.)

This skill does not call Figma or the network. It only runs the diff script and reads
its output.

---

## Workflow

1. Read `inputs/library-current.json` and `inputs/library-baseline.json`. If either is
   missing/empty, tell the user to run the corresponding plugin export and paste the
   JSON in, then stop.
2. Read `tools/8-publish-prep/knowledge/classification-rules.md`. Also skim
   `tools/8-publish-prep/knowledge/style-publish-exclusions.md` and
   `tools/8-publish-prep/knowledge/component-publish-exclusions.md` - their glob
   patterns are applied by the script to exclude styles/components hidden from
   publishing in Figma (which the plugin export cannot detect). Keep them in sync with
   what's hidden in the library.
3. Run the diff script from the workspace root:
   ```bash
   python3 tools/8-publish-prep/script/library_diff.py
   ```
   It writes two files to `outputs/8-publish-prep/`:
   - `YYYY-MM-DD-HH-MM-publish-prep-diff.json` (machine diff)
   - `YYYY-MM-DD-HH-MM-publish-prep.md` (report)
   If the script prints an error (missing/empty input, malformed JSON), relay it to the
   user and stop.
4. Read the generated `*-publish-prep-diff.json`. The script writes the report with a
   human-readable summary at the top and all granular machine output below it. Using
   only the structured diff, **fill in the two placeholder sections** the script left at
   the top of the generated `*-publish-prep.md` - the `## Summary` and `## Slack
   announcement (copy/paste)` sections. Replace the italic `_To be completed..._`
   placeholder lines in place; leave the `## Details` section (inputs, counts, per-item
   Variables/Styles/Components, excluded lists) untouched below them.
   - **`## Summary`** - a concise design-team summary covering:
     - **Changed and previously published** - per item, the meaningful changes phrased
       for designers (e.g. "`color/text/primary` dark mode lightened from #FFFFFF to
       #F5F5F5"). Call out anything flagged `willUnpublish`.
     - **New (publish-eligible)** - new variables/styles/components that are not
       private/hidden.
     - **Removed on publish** - items in the last publish that are now gone.
     - **Component changes** - for each changed component/set, describe both how the
       publishable API changed (e.g. "`Button` gained a `Large` size variant", "`Card`
       description updated", "new `Disabled` boolean property") and how the visuals
       changed, translating layer-path diffs into designer terms (e.g. "`Button` hover
       stroke darkened #E5E5E5 -> #D4D4D4", "container padding 8 -> 12", "`Card` corner
       radius 4 -> 8"). Layer changes appear in the diff as fields prefixed with
       ``layer `<path>` `` (e.g. ``layer `Button/Background` strokes[0].color``). Call
       out renames and anything flagged `willUnpublish`. If the diff JSON `warnings`
       mention missing layer data, tell the user visual changes were not diffed and to
       re-export with the updated plugin (schema v3+).
     - **Variable changes**, **Style changes**, and **Component changes** grouped so they
       can be pasted into a library update note.
     Mention the excluded (not-for-publish) counts so nothing looks lost.
   - **`## Slack announcement (copy/paste)`** - see the dedicated section below.
5. Do not modify the input files. Only run the script and write/edit the report in
   `outputs/8-publish-prep/`.

---

## Slack announcement (copy/paste)

The `## Slack announcement (copy/paste)` section at the top of the report gives the user
a ready-to-send message for the broader design team. Author it as a single fenced code
block (so it copies cleanly) using the structured diff, then add the reminder note below
it. Only include publish-eligible items (the diff's `new` and `changed` buckets) - never
list anything in `privateNew`/excluded, removed, or `willUnpublish`.

Use this exact wording for the intro and outro, with the body in between:

```
Hey everyone! We just pushed an update to our Design System libraries. Unless otherwise noted, everything has been implemented and QA'ed with engineering.

[Library Name]
- [Component]: [short summary of what changed]
- [Component]: [short summary of what changed]

Tokens & styles:
- [name]: [short summary of what changed]

Let us know via the #ask-design-system channel if you run into any questions or log a bug in our intake form here! Additionally, please feel free to make use of DS Office Hours by signing up for a time to chat with the team. More updates are on the way soon, so stay tuned!
```

Body rules:
- Keep `[Library Name]` as a literal placeholder - do not guess the marketing name.
- Under `[Library Name]`, write a **flat** `- [Component]: [summary]` list (one line per
  new/changed component). Do **not** group by platform: the exports cannot tell whether a
  component is native-mobile, web, or both, so do not categorize.
- Add the `Tokens & styles:` group only when there are notable new/changed variables or
  styles; drop the whole group if there are none. Keep these lines short too.
- After the fenced block, add a one-line reminder, e.g.: "_Before sending: replace
  [Library Name] and, if you want the platform breakdown from the usual template, sort
  each line under native-mobile-only / native-mobile-&-web / web-only._"

Writing the `[Component]: [summary]` lines:
- Short, plain-language, and designer-facing - enough for a designer to instantly grasp
  what changed. These are **not** release notes or technical change logs.
- Translate the diff into outcomes, not mechanics. Prefer "Avatar: rebuilt with new
  size and content options, plus hover/pressed states" over "Avatar: `size` variant
  renamed to `Size`, new `Interaction` axis added".
- One line per component; combine multiple small changes into a single readable phrase.
- For brand-new components, say so simply (e.g. "Merchant Logo: new component").

---

## Notes

- The Figma plugin is required to produce the inputs; this skill assumes the two JSON
  files are already pasted in.
- The baseline reflects whatever was last published to the subscribed library, so a
  fresh baseline is pulled each run - there is no stored baseline to maintain.
- Matching is by Figma `key` then `name`; renames are detected rather than reported as
  add + delete. See the knowledge file for the full rules.
