#!/usr/bin/env python3
"""
Library Publish Prep diff.

Compares the CURRENT (local, working) library snapshot against the BASELINE
(remote, last-published) snapshot and reports what a publish would change.

Reads:
  - inputs/library-current.json    (plugin "Export Current", source="current")
  - inputs/library-baseline.json   (plugin "Export Baseline", source="baseline")
  - inputs/inputs.json             (optional; mainLibraryUrl for report context)

Writes:
  - outputs/8-publish-prep/YYYY-MM-DD-HH-MM-publish-prep-diff.json   (machine diff)
  - outputs/8-publish-prep/YYYY-MM-DD-HH-MM-publish-prep.md          (report)

Matching: by Figma `key` first, then by `name` (so renames are detected, not
double-counted as add+delete). Comparison is deterministic: floats rounded,
colors -> hex, variable aliases -> "@name", mode values compared by modeName
(mode IDs differ between a local file and a subscribed library).
"""

import fnmatch
import json
import os
import sys
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
INPUTS_DIR = os.path.join(REPO_ROOT, "inputs")
OUTPUTS_DIR = os.path.join(REPO_ROOT, "outputs", "8-publish-prep")
KNOWLEDGE_DIR = os.path.join(SCRIPT_DIR, "..", "knowledge")

CURRENT_PATH = os.path.join(INPUTS_DIR, "library-current.json")
BASELINE_PATH = os.path.join(INPUTS_DIR, "library-baseline.json")
INPUTS_JSON = os.path.join(INPUTS_DIR, "inputs.json")
STYLE_EXCLUSIONS_PATH = os.path.join(KNOWLEDGE_DIR, "style-publish-exclusions.md")
COMPONENT_EXCLUSIONS_PATH = os.path.join(KNOWLEDGE_DIR, "component-publish-exclusions.md")

PRIVATE_PREFIXES = (".", "_")


# ----------------------------------------------------------------------------
# Normalization
# ----------------------------------------------------------------------------

def _channel(x):
    return max(0, min(255, round((x or 0) * 255)))


def color_to_hex(c):
    r, g, b = _channel(c.get("r")), _channel(c.get("g")), _channel(c.get("b"))
    a = c.get("a")
    if a is None or abs(a - 1.0) < 1e-6:
        return "#{:02X}{:02X}{:02X}".format(r, g, b)
    return "#{:02X}{:02X}{:02X}{:02X}".format(r, g, b, _channel(a))


def normalize(value):
    """Recursively reduce a value to a deterministic, comparable form."""
    if value is None:
        return None
    if isinstance(value, dict):
        if value.get("type") == "VARIABLE_ALIAS":
            return "@" + str(value.get("name") or value.get("id") or "")
        if "r" in value and "g" in value and "b" in value:
            return color_to_hex(value)
        return {k: normalize(value[k]) for k in sorted(value.keys())}
    if isinstance(value, list):
        return [normalize(v) for v in value]
    if isinstance(value, bool):
        return value
    if isinstance(value, float):
        return round(value, 4)
    return value


def fmt(value):
    if value is None:
        return "(none)"
    if isinstance(value, (dict, list)):
        return json.dumps(value, sort_keys=True, separators=(",", ":"))
    return str(value)


# ----------------------------------------------------------------------------
# Loading
# ----------------------------------------------------------------------------

def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path) as f:
        text = f.read().strip()
    if not text:
        return None
    return json.loads(text)


def load_inputs_url():
    data = load_json(INPUTS_JSON) or {}
    return (data.get("mainLibraryUrl") or "").strip()


def load_exclusion_patterns(path):
    """Read glob patterns from a publish-exclusions knowledge doc.

    Patterns live inside fenced code blocks (``` ... ```). Blank lines and lines
    starting with `#` are ignored. Returns [] if the file is missing or empty so
    the diff behaves exactly as before when no exclusions are configured.
    """
    if not os.path.exists(path):
        return []
    with open(path) as f:
        lines = f.read().splitlines()

    patterns = []
    in_fence = False
    for raw in lines:
        stripped = raw.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            continue
        if not stripped or stripped.startswith("#"):
            continue
        patterns.append(stripped)
    return patterns


# ----------------------------------------------------------------------------
# Diffing
# ----------------------------------------------------------------------------

def variable_modes(var):
    out = {}
    for mode in (var.get("valuesByMode") or {}).values():
        out[mode.get("modeName")] = normalize(mode.get("value"))
    return out


def variable_changes(old, new):
    changes = []
    old_modes, new_modes = variable_modes(old), variable_modes(new)
    for mode_name in sorted(set(old_modes) | set(new_modes), key=lambda m: str(m)):
        o, n = old_modes.get(mode_name), new_modes.get(mode_name)
        if o != n:
            changes.append({"field": "value ({})".format(mode_name), "old": fmt(o), "new": fmt(n)})
    if sorted(old.get("scopes", [])) != sorted(new.get("scopes", [])):
        changes.append({"field": "scopes", "old": fmt(sorted(old.get("scopes", []))),
                        "new": fmt(sorted(new.get("scopes", [])))})
    if bool(old.get("hiddenFromPublishing")) != bool(new.get("hiddenFromPublishing")):
        changes.append({"field": "hiddenFromPublishing", "old": fmt(bool(old.get("hiddenFromPublishing"))),
                        "new": fmt(bool(new.get("hiddenFromPublishing")))})
    if old.get("collection") != new.get("collection"):
        changes.append({"field": "collection", "old": fmt(old.get("collection")), "new": fmt(new.get("collection"))})
    if old.get("resolvedType") != new.get("resolvedType"):
        changes.append({"field": "resolvedType", "old": fmt(old.get("resolvedType")), "new": fmt(new.get("resolvedType"))})
    return changes


def style_props(style):
    t = style.get("type")
    if t == "PAINT":
        return {"paints": normalize(style.get("paints"))}
    if t == "TEXT":
        return {"text": normalize(style.get("text"))}
    if t == "EFFECT":
        return {"effects": normalize(style.get("effects"))}
    if t == "GRID":
        return {"grids": normalize(style.get("grids"))}
    return {}


def deep_diff(old, new, path=""):
    results = []
    if type(old) is not type(new):
        results.append({"field": path or "(root)", "old": fmt(old), "new": fmt(new)})
        return results
    if isinstance(old, dict):
        for k in sorted(set(old) | set(new)):
            results += deep_diff(old.get(k), new.get(k), "{}.{}".format(path, k) if path else k)
    elif isinstance(old, list):
        if len(old) != len(new):
            results.append({"field": "{} (count)".format(path or "list"), "old": len(old), "new": len(new)})
        for i in range(min(len(old), len(new))):
            results += deep_diff(old[i], new[i], "{}[{}]".format(path, i))
    else:
        if old != new:
            results.append({"field": path or "(root)", "old": fmt(old), "new": fmt(new)})
    return results


def style_changes(old, new):
    changes = deep_diff(style_props(old), style_props(new))
    if old.get("description") != new.get("description"):
        changes.append({"field": "description", "old": fmt(old.get("description")), "new": fmt(new.get("description"))})
    return changes


def component_props(comp):
    return {
        "componentProperties": normalize(comp.get("componentProperties") or {}),
        "documentationLinks": normalize(comp.get("documentationLinks") or []),
    }


def layers_by_path(layers):
    out = {}
    for layer in (layers or []):
        path = layer.get("path")
        if path is not None:
            out[path] = layer
    return out


def layer_changes(old, new):
    """Diff a component's internal layer tree by name-path.

    Layers are matched by their stable `path` (node IDs differ between a local
    file and a subscribed library), so reordering or insertion is reported per
    layer rather than cascading. Only runs when BOTH sides captured `layers`
    (schema v3+); a stale baseline lacking layers skips this and is warned about
    at the top level so visual changes are never silently dropped or flooded as
    "added".
    """
    old_layers, new_layers = old.get("layers"), new.get("layers")
    if not isinstance(old_layers, list) or not isinstance(new_layers, list):
        return []

    old_map, new_map = layers_by_path(old_layers), layers_by_path(new_layers)
    changes = []
    for path in sorted(set(old_map) | set(new_map)):
        o, n = old_map.get(path), new_map.get(path)
        if o is None:
            changes.append({"field": "layer `{}` (added)".format(path),
                            "old": "(none)", "new": fmt(n.get("type"))})
            continue
        if n is None:
            changes.append({"field": "layer `{}` (removed)".format(path),
                            "old": fmt(o.get("type")), "new": "(none)"})
            continue
        if o.get("type") != n.get("type"):
            changes.append({"field": "layer `{}` type".format(path),
                            "old": fmt(o.get("type")), "new": fmt(n.get("type"))})
        for pd in deep_diff(normalize(o.get("props") or {}), normalize(n.get("props") or {})):
            changes.append({"field": "layer `{}` {}".format(path, pd["field"]),
                            "old": pd["old"], "new": pd["new"]})
    return changes


def component_changes(old, new):
    changes = deep_diff(component_props(old), component_props(new))
    if old.get("description") != new.get("description"):
        changes.append({"field": "description", "old": fmt(old.get("description")), "new": fmt(new.get("description"))})
    if old.get("type") != new.get("type"):
        changes.append({"field": "type", "old": fmt(old.get("type")), "new": fmt(new.get("type"))})
    changes += layer_changes(old, new)
    return changes


def is_private_variable(v):
    return bool(v.get("hiddenFromPublishing"))


def style_exclusion_reason(s, patterns):
    """Return why a style is not-for-publish, or None if it is publishable.

    "prefix"        -> name (full path) starts with a private prefix (. or _)
    "pattern:<glob>" -> name matches a configured exclusion glob
    """
    name = s.get("name", "")
    if name.startswith(PRIVATE_PREFIXES):
        return "prefix"
    for pat in patterns:
        if fnmatch.fnmatchcase(name, pat):
            return "pattern:{}".format(pat)
    return None


def is_private_style(s, patterns=()):
    return style_exclusion_reason(s, patterns) is not None


def classify(current_items, baseline_items, private_reason_fn, change_fn):
    base_by_key, base_by_name = {}, {}
    for i, b in enumerate(baseline_items):
        k = b.get("key")
        if k:
            base_by_key.setdefault(k, i)
        base_by_name.setdefault(b.get("name"), i)

    matched = set()
    new_items, private_new, changed = [], [], []

    for c in current_items:
        bi = None
        k = c.get("key")
        if k and k in base_by_key:
            bi = base_by_key[k]
        elif c.get("name") in base_by_name:
            bi = base_by_name[c.get("name")]

        reason = private_reason_fn(c)

        if bi is None:
            entry = {"name": c.get("name"), "key": k, "collection": c.get("collection"), "type": c.get("type")}
            if reason:
                entry["excludedBy"] = reason
                private_new.append(entry)
            else:
                new_items.append(entry)
            continue

        matched.add(bi)
        b = baseline_items[bi]
        changes = change_fn(b, c)
        renamed = b.get("name") != c.get("name")
        will_unpublish = bool(reason)
        if changes or renamed or will_unpublish:
            changed.append({
                "name": c.get("name"),
                "oldName": b.get("name") if renamed else None,
                "key": k,
                "collection": c.get("collection"),
                "type": c.get("type"),
                "willUnpublish": will_unpublish,
                "excludedBy": reason if will_unpublish else None,
                "changes": changes,
            })

    removed = [
        {"name": baseline_items[i].get("name"), "key": baseline_items[i].get("key"),
         "collection": baseline_items[i].get("collection"), "type": baseline_items[i].get("type")}
        for i in range(len(baseline_items)) if i not in matched
    ]
    return {"new": new_items, "privateNew": private_new, "changed": changed, "removed": removed}


# ----------------------------------------------------------------------------
# Report
# ----------------------------------------------------------------------------

def render_changed_block(lines, entries, label_singular):
    if not entries:
        lines.append("None.")
        lines.append("")
        return
    for e in entries:
        title = "`{}`".format(e["name"])
        if e.get("oldName"):
            title = "`{}` (renamed from `{}`)".format(e["name"], e["oldName"])
        if e.get("willUnpublish"):
            title += " - now private/hidden, will be REMOVED on publish"
        lines.append("- {}".format(title))
        for ch in e["changes"]:
            lines.append("  - {}: `{}` -> `{}`".format(ch["field"], ch["old"], ch["new"]))
        lines.append("")


def render_list_block(lines, entries):
    if not entries:
        lines.append("None.")
        lines.append("")
        return
    for e in entries:
        extra = []
        if e.get("type"):
            extra.append(e["type"])
        if e.get("collection"):
            extra.append(e["collection"])
        suffix = " ({})".format(", ".join(extra)) if extra else ""
        lines.append("- `{}`{}".format(e["name"], suffix))
    lines.append("")


def render_excluded_block(lines, entries):
    if not entries:
        lines.append("None.")
        lines.append("")
        return
    for e in entries:
        reason = e.get("excludedBy") or "excluded"
        if reason == "prefix":
            reason = "private prefix (`.`/`_`)"
        elif reason.startswith("pattern:"):
            reason = "pattern `{}`".format(reason[len("pattern:"):])
        suffix = " ({})".format(e["type"]) if e.get("type") else ""
        lines.append("- `{}`{} - {}".format(e["name"], suffix, reason))
    lines.append("")


def main():
    os.makedirs(OUTPUTS_DIR, exist_ok=True)

    current = load_json(CURRENT_PATH)
    baseline = load_json(BASELINE_PATH)

    if current is None:
        print("ERROR: inputs/library-current.json is missing or empty. "
              "Run the plugin in Export Current mode and paste the JSON there.")
        sys.exit(1)
    if baseline is None:
        print("ERROR: inputs/library-baseline.json is missing or empty. "
              "Run the plugin in Export Baseline mode and paste the JSON there.")
        sys.exit(1)

    warnings = []
    if current.get("source") != "current":
        warnings.append("library-current.json has source='{}' (expected 'current').".format(current.get("source")))
    if baseline.get("source") != "baseline":
        warnings.append("library-baseline.json has source='{}' (expected 'baseline').".format(baseline.get("source")))

    cur_vars = current.get("variables", [])
    cur_styles = current.get("styles", [])
    cur_components = current.get("components", [])
    base_vars = baseline.get("variables", [])
    base_styles = baseline.get("styles", [])
    base_components = baseline.get("components", [])

    # Component layer/visual diffing requires both snapshots to carry `layers`
    # (plugin schema v3+). If only one side has them, layer diffing is skipped
    # (layer_changes guards per pair); warn so the gap is visible.
    def _any_layers(items):
        return any(isinstance(c.get("layers"), list) for c in items)

    cur_has_layers, base_has_layers = _any_layers(cur_components), _any_layers(base_components)
    if cur_has_layers and not base_has_layers:
        warnings.append("Baseline snapshot has no component layer data (exported with an older "
                        "plugin). Component visual/layer changes were NOT diffed - re-export the "
                        "baseline with the updated plugin (schema v3+) to capture stroke/padding/"
                        "fill/radius/effect changes.")
    elif base_has_layers and not cur_has_layers:
        warnings.append("Current snapshot has no component layer data (exported with an older "
                        "plugin). Component visual/layer changes were NOT diffed - re-export the "
                        "current library with the updated plugin (schema v3+).")

    exclusion_patterns = load_exclusion_patterns(STYLE_EXCLUSIONS_PATH)
    component_exclusion_patterns = load_exclusion_patterns(COMPONENT_EXCLUSIONS_PATH)

    var_diff = classify(
        cur_vars, base_vars,
        lambda v: "hidden" if is_private_variable(v) else None,
        variable_changes,
    )
    style_diff = classify(
        cur_styles, base_styles,
        lambda s: style_exclusion_reason(s, exclusion_patterns),
        style_changes,
    )
    # Components share the style exclusion logic (private `.`/`_` prefix + glob
    # patterns); Figma's plugin API can't expose "hide from publishing" for
    # components either, so patterns are the workaround.
    component_diff = classify(
        cur_components, base_components,
        lambda c: style_exclusion_reason(c, component_exclusion_patterns),
        component_changes,
    )

    ts = datetime.now().strftime("%Y-%m-%d-%H-%M")
    diff_path = os.path.join(OUTPUTS_DIR, "{}-publish-prep-diff.json".format(ts))
    md_path = os.path.join(OUTPUTS_DIR, "{}-publish-prep.md".format(ts))

    machine = {
        "generatedAt": datetime.now().isoformat(),
        "inputs": {
            "mainLibraryUrl": load_inputs_url(),
            "currentExportedAt": current.get("exportedAt"),
            "baselineExportedAt": baseline.get("exportedAt"),
            "baselineLibraryName": baseline.get("libraryName"),
            "exclusionPatterns": exclusion_patterns,
            "componentExclusionPatterns": component_exclusion_patterns,
            "counts": {
                "currentVariables": len(cur_vars), "baselineVariables": len(base_vars),
                "currentStyles": len(cur_styles), "baselineStyles": len(base_styles),
                "currentComponents": len(cur_components), "baselineComponents": len(base_components),
            },
        },
        "warnings": warnings,
        "variables": var_diff,
        "styles": style_diff,
        "components": component_diff,
    }
    with open(diff_path, "w") as f:
        json.dump(machine, f, indent=2)

    lines = []
    lines.append("# Library Publish Prep")
    lines.append("")
    lines.append("**Date:** {}".format(ts))
    if load_inputs_url():
        lines.append("**Library:** {}".format(load_inputs_url()))
    if baseline.get("libraryName"):
        lines.append("**Baseline library:** {}".format(baseline.get("libraryName")))
    lines.append("")
    if warnings:
        lines.append("> Warnings:")
        for w in warnings:
            lines.append("> - {}".format(w))
        lines.append("")

    # Top of report: agent-authored summary + Slack draft go here. The script
    # only writes placeholders; the publish-prep skill replaces them using the
    # structured diff JSON. All deterministic machine output lives under
    # "## Details" below so the human-readable summary always leads.
    lines.append("## Summary")
    lines.append("")
    lines.append("_To be completed by the publish-prep skill from the structured diff "
                 "(see Details below)._")
    lines.append("")
    lines.append("## Slack announcement (copy/paste)")
    lines.append("")
    lines.append("_To be completed by the publish-prep skill. Fill [Library Name] from the "
                 "baseline library name (`{}`); add native-mobile/web categories before "
                 "sending._".format(baseline.get("libraryName") or "unknown"))
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Details")
    lines.append("")

    lines.append("### Inputs used")
    lines.append("")
    lines.append("- Current (local) exported at: `{}` - {} variables, {} styles, {} components".format(
        current.get("exportedAt"), len(cur_vars), len(cur_styles), len(cur_components)))
    lines.append("- Baseline (last published) exported at: `{}` - {} variables, {} styles, {} components".format(
        baseline.get("exportedAt"), len(base_vars), len(base_styles), len(base_components)))
    lines.append("")

    lines.append("### Counts")
    lines.append("")
    lines.append("| Category | New | Changed | Removed |")
    lines.append("|---|---|---|---|")
    lines.append("| Variables | {} | {} | {} |".format(
        len(var_diff["new"]), len(var_diff["changed"]), len(var_diff["removed"])))
    lines.append("| Styles | {} | {} | {} |".format(
        len(style_diff["new"]), len(style_diff["changed"]), len(style_diff["removed"])))
    lines.append("| Components | {} | {} | {} |".format(
        len(component_diff["new"]), len(component_diff["changed"]), len(component_diff["removed"])))
    lines.append("")
    if var_diff["privateNew"] or style_diff["privateNew"] or component_diff["privateNew"]:
        lines.append("_Excluded as not-for-publish (hidden variables / `.`|`_` prefixed or "
                     "exclusion-pattern styles & components): {} variable(s), {} style(s), "
                     "{} component(s). See 'Excluded from publish' below._".format(
                         len(var_diff["privateNew"]), len(style_diff["privateNew"]),
                         len(component_diff["privateNew"])))
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("### Variables")
    lines.append("")
    lines.append("#### New (publish-eligible)")
    lines.append("")
    render_list_block(lines, var_diff["new"])
    lines.append("#### Changed since last publish")
    lines.append("")
    render_changed_block(lines, var_diff["changed"], "variable")
    lines.append("#### Removed on publish (in last published, missing now)")
    lines.append("")
    render_list_block(lines, var_diff["removed"])

    lines.append("---")
    lines.append("")
    lines.append("### Styles")
    lines.append("")
    lines.append("#### New (publish-eligible)")
    lines.append("")
    render_list_block(lines, style_diff["new"])
    lines.append("#### Changed since last publish")
    lines.append("")
    render_changed_block(lines, style_diff["changed"], "style")
    lines.append("#### Removed on publish (in last published, missing now)")
    lines.append("")
    render_list_block(lines, style_diff["removed"])
    lines.append("#### Excluded from publish (patterns / prefixes)")
    lines.append("")
    render_excluded_block(lines, style_diff["privateNew"])

    lines.append("---")
    lines.append("")
    lines.append("### Components")
    lines.append("")
    lines.append("#### New (publish-eligible)")
    lines.append("")
    render_list_block(lines, component_diff["new"])
    lines.append("#### Changed since last publish")
    lines.append("")
    render_changed_block(lines, component_diff["changed"], "component")
    lines.append("#### Removed on publish (in last published, missing now)")
    lines.append("")
    render_list_block(lines, component_diff["removed"])
    lines.append("#### Excluded from publish (patterns / prefixes)")
    lines.append("")
    render_excluded_block(lines, component_diff["privateNew"])

    with open(md_path, "w") as f:
        f.write("\n".join(lines))

    print("Variables  - new: {}  changed: {}  removed: {}  (excluded: {})".format(
        len(var_diff["new"]), len(var_diff["changed"]), len(var_diff["removed"]), len(var_diff["privateNew"])))
    print("Styles     - new: {}  changed: {}  removed: {}  (excluded: {})".format(
        len(style_diff["new"]), len(style_diff["changed"]), len(style_diff["removed"]), len(style_diff["privateNew"])))
    print("Components - new: {}  changed: {}  removed: {}  (excluded: {})".format(
        len(component_diff["new"]), len(component_diff["changed"]), len(component_diff["removed"]), len(component_diff["privateNew"])))
    if warnings:
        print("Warnings: {}".format("; ".join(warnings)))
    print("Diff JSON: {}".format(diff_path))
    print("Report:    {}".format(md_path))


if __name__ == "__main__":
    main()
