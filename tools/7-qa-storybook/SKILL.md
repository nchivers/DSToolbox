---
name: qa-storybook
description: Checks out a PR branch in the ux repo, runs a clean Storybook dev build on iOS Simulator (idb) or Android Emulator (adb), drives the app to inspect each variant of the named component against Figma (Figma MCP first, inputs/figma-variables.json fallback), and writes a QA report to outputs/7-qa-storybook. Use when QA-ing a component PR in the mobile Storybook app.
---

# QA Storybook

Check out a pull request branch in the **ux** monorepo, perform a clean Storybook build, start the dev server, launch the app on the user's chosen mobile platform, then drive Storybook via `idb` (iOS) or `adb` (Android) to compare the rendered redesign of the component against Figma. Write findings to a single results file.

---

## Inputs

Read **inputs/inputs.json** (paths relative to workspace root):

| Key | Purpose |
|-----|---------|
| `pullRequestUrl` | **Required.** Full URL to the GitHub pull request (e.g. `https://github.com/Affirm/ux/pull/42`). Used to resolve the PR head branch to check out. |
| `componentName` | **Required.** Short name for the component (e.g. `Divider`, `Section Header`). Used to find the component in the Storybook left-nav, to label findings, and in the output filename. |
| `componentUrl` | **Required.** Figma link to the component (e.g. `https://www.figma.com/design/FILE_KEY/...?node-id=NODE_ID`). Used by Figma MCP to fetch the source-of-truth tokens, layer names, and design context. |
| `subcomponents` | **Optional.** Array of `{ "name": "UserSuppliedName", "subcomponentUrl": "https://..." }`. When present, fetch each subcomponent's Figma context and include its tokens/layer names in the comparison. |

Fixed paths used by this skill:

| Path | Purpose |
|------|---------|
| `inputs/figma-variables.json` | Fallback for token resolution. Walk this when the Figma MCP response leaves an alias unresolved, to ground out at base primitives (hex / px / typography). |
| `tools/7-qa-storybook/utils/capture.sh` | Captures screenshot + UI hierarchy from the connected simulator/emulator into `tools/7-qa-storybook/.tmp/`. |
| `tools/7-qa-storybook/utils/cleanup.sh` | Safely removes only `capture-*.png`, `hierarchy-*.xml`, `hierarchy-*.json` from the `.tmp` dir. |

---

## Workflow

### 1. Navigate to the ux repo

All build and run commands execute in the **ux** repo located at `../ux` relative to this workspace root.

- Verify `../ux` exists and contains a `.git` directory.
- If it does not exist, **stop** and tell the user to run the `ds-toolbox-setup-mobile` command first to clone the repo.
- Use `../ux` as the working directory for all subsequent build/run shell commands. **Capture/inspect commands run from the DSToolbox workspace root** so the vendored scripts resolve correctly.

### 2. Resolve the PR branch

Parse `pullRequestUrl` to extract **owner**, **repo**, and **PR number** (format: `https://github.com/{owner}/{repo}/pull/{number}`).

Run:

```
gh pr view <number> --repo <owner>/<repo> --json headRefName,headRefOid -q '.headRefName + " " + .headRefOid'
```

This returns the branch name and head SHA for the PR. Record both — head SHA goes in the report.

### 3. Fetch and checkout the branch

Run these commands sequentially in `../ux`:

```
git fetch origin <branch>
git checkout <branch>
git pull origin <branch>
```

This ensures the local copy is fully up to date with the remote PR head.

### 4. Ask the user which platform to launch

Use the **AskQuestion** tool to ask:

> Which platform would you like to open Storybook on?
> - iOS Simulator
> - Android Emulator

### 5. Clean build and launch on device

Run the following as a single chained command in `../ux`, substituting the platform based on the user's choice:

- **iOS Simulator:**
```
pnpm i && pnpm --filter storybook prebuild:clean && pnpm --filter storybook ios
```

- **Android Emulator:**
```
pnpm i && pnpm --filter storybook prebuild:clean && pnpm --filter storybook android
```

This command:
1. Installs all monorepo dependencies.
2. Runs a clean prebuild for the storybook package (generates native project files fresh).
3. Builds and launches the Storybook app on the chosen platform (the platform command handles starting the simulator/emulator automatically).

The build is **long-running**. Start it with `block_until_ms: 0` (immediately background it), then monitor the terminal output for build completion or errors.

### 6. Wait for the app to be interactive

Storybook's Metro bundler runs on **port 8082** (not 8081 — that is the mobile app's Metro).

Poll until Metro is listening:

```
lsof -i :8082 | grep LISTEN
```

Then make sure UI is captureable:

- **Android:** run `adb reverse tcp:8082 tcp:8082`, then confirm `adb shell uiautomator dump /sdcard/_probe.xml` succeeds (delete the probe file after).
- **iOS:** confirm `idb list-targets` shows a `Booted` simulator and `idb ui describe-all` returns a non-empty tree.

Once both pass, run the cleanup script to start with a fresh `.tmp`:

```
tools/7-qa-storybook/utils/cleanup.sh
```

### 7. Resolve the Figma source of truth (Figma MCP first)

Parse `componentUrl` for **fileKey** (first path segment after `/design/`; ignore any `branch/...` segment) and **nodeId** (`node-id` query param; decode `5%3A3602` to `5-3602`).

Call the Figma MCP server:

- `get_variable_defs(fileKey, nodeId)` — variables and styles used by the component (colors, spacing, typography).
- `get_design_context(fileKey, nodeId)` — node-level detail so each finding can be labeled with a **layer name**.
- `get_metadata(fileKey, nodeId)` — layer IDs, names, types, positions, sizes.

Repeat all three calls for every entry in `subcomponents[]` (parse `subcomponentUrl` the same way). Match each subcomponent to INSTANCE nodes in the root metadata and label its findings with the user-supplied `name`.

Build a resolved-tokens cache: for every variable used by the component, resolve to a base primitive — hex (e.g. `#DDDEE2`), pixel size (e.g. `1px`), or typography spec (font family, size, line-height, weight). For aliases the MCP response leaves unresolved, walk **`inputs/figma-variables.json`** until you reach a primitive.

State both **states** the component supports in Figma (e.g. Resting, Pressed, Disabled, Hover, Focus-Visible) and **properties** (variants, booleans, content swaps, text). Keep two lists for use in step 13:

- `figmaStatesAll` — every state Figma defines.
- `figmaStatesReachable` — `figmaStatesAll` minus any whose name contains `hover` or `focus-visible` (case-insensitive). The latter are not reachable on a touch device and are intentionally skipped.

### 8. Navigate Storybook to the component

Capture and read the current screen:

```
tools/7-qa-storybook/utils/capture.sh <android|ios>
```

Search the resulting hierarchy file (`tools/7-qa-storybook/.tmp/hierarchy-*.xml` or `.json`) for an entry whose visible text matches `componentName` (case-insensitive; allow hyphen/underscore/space variants).

**Redesign vs Legacy:** if both a non-Legacy and a `*Legacy` entry exist for `componentName`, **always pick the non-Legacy entry** — that is the redesign. Record the `*Legacy` entry as explicitly skipped.

Tap the entry using bounds from the hierarchy:

- **Android:** `adb shell input tap <x> <y>` (center of `bounds="[L,T][R,B]"`).
- **iOS:** `idb ui tap <x> <y>` (`x + width/2`, `y + height/2` from the `frame`).

Wait 2s, recapture, confirm you are on the component's story page.

### 9. Switch the top-left toggle from "Original" to "Redesign" (when present)

Search the latest hierarchy for a control in the top toolbar region whose text contains `Original` or `Redesign`.

- If a toggle is present and currently on `Original`, tap it to flip to `Redesign`. Wait 2s, recapture.
- If no toggle is present, skip without error and note "no redesign toggle present" in the report.

### 10. Open the React Native dev menu and enable the Element Inspector

The dev menu exposes "Show Element Inspector" / "Toggle Inspector". When it is on, tapping any element overlays the rendered values (color, fontSize, fontFamily, fontWeight, lineHeight, padding, margin, width, height, borderRadius, etc.). The inspector reports **resolved primitives only** — it does not show token names — so all comparisons go against the resolved cache from step 7.

Open the menu:

- **iOS Simulator:** open the dev menu with **Cmd+D** delivered to the focused Simulator window:
  ```
  osascript -e 'tell application "Simulator" to activate' -e 'tell application "System Events" to keystroke "d" using command down'
  ```
- **Android Emulator:**
  ```
  adb shell input keyevent 82
  ```

Wait 1s, recapture. Find the "Show Element Inspector" / "Toggle Inspector" entry in the hierarchy and tap it. Re-capture again to confirm the inspector overlay is active.

### 11. Inspect each visible element against Figma

For every distinguishable element in the rendered component (text nodes, fills, dividers, icons, containers):

1. Tap the element via UI hierarchy bounds.
2. Re-capture and read the inspector overlay values from the screenshot.
3. Compare the rendered values to the Figma resolved cache for the matching layer (use Figma `get_design_context`/`get_metadata` layer names to align).
4. Treat differences as a **match** when:
   - Color: equal hex, case-insensitive (`#DDDEE2` == `#dddee2`).
   - Size / spacing / radius: within ≤0.5px.
   - Typography: family matches and size/line-height within ≤0.5px; weight is exactly equal.
5. Skip any Figma state in `figmaStatesAll` whose name contains `hover` or `focus-visible`. Note each skip explicitly in the report.

For each comparison, record: **layer name**, **property** (e.g. `backgroundColor`, `fontSize`), **Figma expected primitive**, **rendered value**, **delta**, **match | mismatch | skipped**.

### 12. Traverse related Storybook pages

The Storybook left-nav typically lists multiple stories per component (variants and states). After finishing the primary redesign story, iterate **every non-Legacy story** under the same component group and repeat steps 10–11 on each. Record which stories were visited and which were skipped (with reason — e.g. `*Legacy`, hover-only).

### 13. Exercise the Storybook Controls panel

Open the **Controls** tab for the redesign story. For each control:

- Toggle / cycle each value where doing so does not require typed input that would derail the run (booleans, selects, variants). Skip free-form text inputs unless they are the only way to surface a Figma-defined property.
- Re-capture between changes and re-inspect any element whose values changed.
- Build a `controlsCoverage` map: for every property/state in `figmaStatesReachable`, mark whether a Storybook control reaches it and whether the rendered effect matches Figma.
- Flag any property/state in `figmaStatesReachable` that has **no** corresponding control or no observable rendered effect.

### 14. Tear down

When inspection is complete:

1. Stop the Metro bundler and any background shells launched in step 5 (the `pnpm --filter storybook ios` / `android` process and any child Metro/watcher processes).
2. Kill any lingering processes on the storybook Metro port:

   ```
   lsof -ti:8082 | xargs kill -9 2>/dev/null || true
   ```

3. Run cleanup to remove the `.tmp` captures (keep only what you reference in the report by copying out beforehand if needed):

   ```
   tools/7-qa-storybook/utils/cleanup.sh
   ```

4. Close any other shells/terminals this skill opened so the workspace is clean.
5. Confirm to the user that Storybook, Metro, and all related processes have been stopped.

### 15. Write the report

Write exactly one results file:

- **Path:** `outputs/7-qa-storybook/YYYY-MM-DD-HH-MM-{componentName}-storybook-qa.md`
  - `componentName` from `inputs/inputs.json`, sanitized for filenames: lowercase; spaces and slashes replaced with hyphens; remove or replace characters unsafe in filenames. If missing, use `component`.
  - `YYYY-MM-DD-HH-MM` is the current local date/time.

**Contents:**

1. **Inputs used** — `pullRequestUrl`, `componentName`, `componentUrl`, full `subcomponents[]` (names + URLs) if present, platform chosen (iOS / Android), PR head ref + head SHA, that Figma data came from Figma MCP (and which calls were used), and whether `inputs/figma-variables.json` was used as fallback.
2. **Storybook navigation** — the story chosen as the redesign target; sibling stories visited; `*Legacy` stories explicitly skipped; whether the top-left "Original / Redesign" toggle was present and flipped.
3. **Figma source of truth** — list of variables/styles resolved from MCP for the root and each subcomponent, with each variable's resolved primitive (hex / px / typography). Call out any aliases that needed `inputs/figma-variables.json` to ground out.
4. **Inspection findings — Discrepancies** — group by story. Per row: **layer name** (from Figma metadata), **property**, **Figma expected primitive**, **rendered value from inspector**, **delta**, **severity** (blocker vs nice-to-fix).
5. **Controls coverage** — table of every Figma-defined property/state in `figmaStatesReachable` and whether a Storybook control reaches it, plus the rendered match result. Explicit list of `figmaStatesAll` entries skipped because they are `hover` or `focus-visible`.
6. **Potential issues** — anything ambiguous: couldn't tap an element, inspector didn't surface a value, story missing from nav, control wouldn't change, etc.
7. **Clear alignment** — properties/elements that matched Figma exactly. Use this section to make the "everything else works" picture obvious.
8. **Summary** — counts: matches, discrepancies (blocker vs nice-to-fix), skipped states (with reason), stories visited.

Use clear headings and bullet lists / tables. Do **not** modify `inputs/inputs.json`, `inputs/figma-variables.json`, or any other input. Only add/update the report under `outputs/7-qa-storybook/`.

---

## Notes

- **This skill produces an output file.** Path: `outputs/7-qa-storybook/YYYY-MM-DD-HH-MM-{componentName}-storybook-qa.md` (see step 15).
- **Hover and focus-visible states are intentionally skipped** because a touch-driven simulator/emulator cannot reach them. They are still recorded in the report (under "Controls coverage → skipped states") so reviewers see they were considered.
- **Confirm focus before `idb ui text` (iOS).** Whenever typing into a field on iOS — whether it's a Storybook search/filter field, a component text control on a story page, or any other text input — first tap the field, recapture, and verify the field is focused before invoking `idb ui text`. Focus indicators to look for in the recapture: the field shows a caret/cursor, the on-screen keyboard is visible, or the field's accessibility node reports `focused="true"` / `hasKeyboardFocus="true"`. If none of those are present, tap the field again and recapture. Only run `idb ui text "..."` once focus is confirmed — calling it without focus drops the keystrokes silently and produces a misleading run.
- **Token resolution order:** Figma MCP first (`get_variable_defs`, `get_design_context`, `get_metadata` on `componentUrl` and each `subcomponentUrl`). When an alias chain is not fully resolved by MCP, walk `inputs/figma-variables.json` until you reach a base primitive. The dev-menu Element Inspector only reveals resolved primitives, so all comparisons happen at that level.
- **Figma is the source of truth.** When the rendered value differs from the resolved Figma primitive (outside the tolerances in step 11), record it as a discrepancy, not as a Figma-side issue.
- **Storybook Metro runs on port 8082**, not 8081. The mobile app uses 8081; do not confuse them.
- **Vendored helpers** live in `tools/7-qa-storybook/utils/`. They write to `tools/7-qa-storybook/.tmp/` and only delete files matching `capture-*.png`, `hierarchy-*.xml`, `hierarchy-*.json`. Do not `rm -rf` the `.tmp` folder by hand.
- The dev server remains running until step 14, at which point the agent shuts everything down.
- If the build fails in step 5, inspect the terminal output for errors and report them to the user before attempting any inspection.
