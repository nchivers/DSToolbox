---
name: publish-prep
description: Prepares a Figma design system library for publishing by diffing the current (local) library state against the last-published (remote) state and producing a per-item change report for variables, styles, and components. Use when preparing a library publish, writing library release notes, or determining which published variables/styles/components changed, are new, or were removed since the last publish.
---

# Library Publish Prep

Diff the current working library against the last-published library and produce a
report of what a publish would change: which published variables/styles/components
changed, which are new and publish-eligible, and which would be removed. For
components, "changed" means the publishable API surface (component property
definitions, variant options, description) - internal layer structure is not diffed.

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

The user runs the plugin twice:

- **Export Current** in the library file or branch -> paste into `inputs/library-current.json`.
- **Export Baseline** in a Baselining File (a file subscribed to the published DS
  library); the plugin reads remote variables via the teamLibrary API and remote
  styles + components via the Figma REST API + import-by-key -> paste into
  `inputs/library-baseline.json`.

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
4. Read the generated `*-publish-prep-diff.json`. Using only that structured diff,
   append a concise **design-team summary** to the generated `*-publish-prep.md` (or
   present it to the user) covering:
   - **Changed and previously published** - per item, the meaningful changes phrased
     for designers (e.g. "`color/text/primary` dark mode lightened from #FFFFFF to
     #F5F5F5"). Call out anything flagged `willUnpublish`.
   - **New (publish-eligible)** - new variables/styles/components that are not
     private/hidden.
   - **Removed on publish** - items in the last publish that are now gone.
   - **Component changes** - for each changed component/set, describe how the
     publishable API changed in designer terms (e.g. "`Button` gained a `Large` size
     variant", "`Card` description updated", "new `Disabled` boolean property"). Call
     out renames and anything flagged `willUnpublish`. Do not infer internal/visual
     changes - the diff only covers component property definitions and metadata.
   - **Variable changes**, **Style changes**, and **Component changes** grouped so they
     can be pasted into a library update note.
   Mention the excluded (not-for-publish) counts so nothing looks lost.
5. Do not modify the input files. Only run the script and write/append to the report in
   `outputs/8-publish-prep/`.

---

## Notes

- The Figma plugin is required to produce the inputs; this skill assumes the two JSON
  files are already pasted in.
- The baseline reflects whatever was last published to the subscribed library, so a
  fresh baseline is pulled each run - there is no stored baseline to maintain.
- Matching is by Figma `key` then `name`; renames are detected rather than reported as
  add + delete. See the knowledge file for the full rules.
