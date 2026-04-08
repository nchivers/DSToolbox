#!/usr/bin/env python3
"""
Figma Token Review Script
Compares component tokens CSV against Figma variables JSON and checks scoping rules.
"""

import csv
import json
import os
from datetime import date

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "inputs", "component-tokens.csv")
JSON_PATH = os.path.join(BASE_DIR, "inputs", "figma-variables.json")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
TODAY = "2026-02-16"
MD_OUTPUT = os.path.join(RESULTS_DIR, f"figma-review-{TODAY}.md")
CSV_OUTPUT = os.path.join(RESULTS_DIR, f"figma-token-mapping-{TODAY}.csv")

COMPONENT_NAME = "merchant_tile"

os.makedirs(RESULTS_DIR, exist_ok=True)


# --- Step 1: Read inputs ---

def read_csv_tokens(path):
    """Read the component tokens CSV and return a list of dicts."""
    tokens = []
    with open(path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            tokens.append({
                "full_token": row["Full Token"].strip(),
                "all_modes": row["All Modes"].strip() if row["All Modes"] else "",
                "light_mode": row["Light Mode"].strip() if row["Light Mode"] else "",
                "dark_mode": row["Dark Mode"].strip() if row["Dark Mode"] else "",
            })
    return tokens


def read_figma_variables(path):
    """Read the Figma variables JSON and return the list."""
    with open(path, "r") as f:
        return json.load(f)


# --- Step 2: Name mapping ---

def csv_name_to_figma_name(csv_token):
    """
    Convert CSV token name to Figma-style name.
    Strip 'affirm.' prefix, replace '.' with '/'.
    e.g. affirm.color.merchant_tile.container.bg.focus_visible
      -> color/merchant_tile/container/bg/focus_visible
    """
    name = csv_token
    if name.startswith("affirm."):
        name = name[len("affirm."):]
    return name.replace(".", "/")


def normalize_name(name):
    """Normalize a name for fuzzy comparison: lowercase, replace spaces with underscores."""
    return name.lower().replace(" ", "_")


# --- Step 3: Task 1 - CSV vs Figma comparison ---

def extract_alias_short(alias_name):
    """
    Extract the short form from a Figma alias name.
    e.g. 'base/g-color/indigo/050' -> 'indigo.050'
         'base/g-color/opacity/000' -> 'opacity.000'
         'base/size/025' -> 'size.025'
    """
    if not alias_name:
        return ""
    parts = alias_name.split("/")
    # For color aliases like 'base/g-color/gray/950', take last 2 segments
    # For size aliases like 'base/size/025', take last 2 segments
    if len(parts) >= 2:
        return f"{parts[-2]}.{parts[-1]}"
    return alias_name


def get_figma_mode_values(figma_var):
    """
    Extract light and dark mode alias short names from a Figma variable.
    Returns (light_value, dark_value) as short names.
    """
    light_val = ""
    dark_val = ""
    all_modes_val = ""

    values_by_mode = figma_var.get("valuesByMode", {})
    for mode_key, mode_data in values_by_mode.items():
        mode_name = mode_data.get("modeName", "")
        value = mode_data.get("value", {})

        if isinstance(value, dict) and value.get("type") == "VARIABLE_ALIAS":
            alias_name = value.get("name", "")
            short = extract_alias_short(alias_name)
        else:
            short = str(value) if value else ""

        if "Light" in mode_name:
            light_val = short
        elif "Dark" in mode_name:
            dark_val = short
        else:
            # Single-mode variable (e.g. spacing, size, radius, position)
            all_modes_val = short

    return all_modes_val, light_val, dark_val


def compare_value(csv_val, figma_val):
    """
    Compare a CSV value like 'indigo.050' against a Figma alias short form like 'indigo.050'.
    Returns True if they match.
    """
    if not csv_val and not figma_val:
        return True
    if not csv_val or not figma_val:
        return False
    return csv_val.strip().lower() == figma_val.strip().lower()


def task1_comparison(csv_tokens, figma_vars):
    """
    Perform Task 1: CSV vs Figma comparison.
    Returns:
      - missing_in_figma: list of CSV tokens not found in Figma
      - extra_in_figma: list of Figma vars (merchant_tile) not in CSV
      - naming_discrepancies: list of (csv_name, figma_name, issue)
      - assignment_discrepancies: list of dicts with discrepancy details
      - matched_pairs: list of (csv_token, figma_var) for matched tokens
    """
    # Build lookup: normalized figma name -> figma var
    figma_by_norm_name = {}
    figma_by_exact_name = {}
    for var in figma_vars:
        name = var.get("name", "")
        figma_by_exact_name[name] = var
        figma_by_norm_name[normalize_name(name)] = var

    # Build set of all merchant_tile Figma variable names (normalized)
    figma_mt_names_norm = set()
    figma_mt_vars = []
    for var in figma_vars:
        name = var.get("name", "")
        if COMPONENT_NAME in name:
            figma_mt_names_norm.add(normalize_name(name))
            figma_mt_vars.append(var)

    missing_in_figma = []
    extra_in_figma_norm = set(figma_mt_names_norm)  # start with all, remove matched
    naming_discrepancies = []
    assignment_discrepancies = []
    matched_pairs = []

    for ct in csv_tokens:
        csv_figma_name = csv_name_to_figma_name(ct["full_token"])
        csv_norm = normalize_name(csv_figma_name)

        # Try exact match first
        figma_var = figma_by_exact_name.get(csv_figma_name)
        matched_norm = None

        if figma_var:
            matched_norm = normalize_name(csv_figma_name)
        else:
            # Try normalized match
            figma_var = figma_by_norm_name.get(csv_norm)
            if figma_var:
                matched_norm = normalize_name(figma_var["name"])
                # Report naming discrepancy if exact names differ
                if csv_figma_name != figma_var["name"]:
                    naming_discrepancies.append({
                        "csv_token": ct["full_token"],
                        "csv_figma_name": csv_figma_name,
                        "figma_name": figma_var["name"],
                        "issue": f"Name mismatch: CSV expects '{csv_figma_name}', Figma has '{figma_var['name']}'"
                    })

        if figma_var:
            matched_pairs.append((ct, figma_var))
            # Remove from extra set
            if matched_norm in extra_in_figma_norm:
                extra_in_figma_norm.discard(matched_norm)

            # Check assignment discrepancies for color tokens (light/dark modes)
            if ct["light_mode"] or ct["dark_mode"]:
                figma_all, figma_light, figma_dark = get_figma_mode_values(figma_var)

                if ct["light_mode"] and not compare_value(ct["light_mode"], figma_light):
                    assignment_discrepancies.append({
                        "csv_token": ct["full_token"],
                        "mode": "Light",
                        "csv_value": ct["light_mode"],
                        "figma_value": figma_light,
                    })
                if ct["dark_mode"] and not compare_value(ct["dark_mode"], figma_dark):
                    assignment_discrepancies.append({
                        "csv_token": ct["full_token"],
                        "mode": "Dark",
                        "csv_value": ct["dark_mode"],
                        "figma_value": figma_dark,
                    })

            # Check All Modes value
            if ct["all_modes"]:
                figma_all, figma_light, figma_dark = get_figma_mode_values(figma_var)
                if not compare_value(ct["all_modes"], figma_all):
                    assignment_discrepancies.append({
                        "csv_token": ct["full_token"],
                        "mode": "All Modes",
                        "csv_value": ct["all_modes"],
                        "figma_value": figma_all,
                    })
        else:
            missing_in_figma.append(ct)

    # Extra in Figma: merchant_tile vars that were not matched
    extra_in_figma = []
    for var in figma_mt_vars:
        if normalize_name(var["name"]) in extra_in_figma_norm:
            extra_in_figma.append(var)

    return missing_in_figma, extra_in_figma, naming_discrepancies, assignment_discrepancies, matched_pairs


# --- Step 4: Task 2 - Scoping rules evaluation ---

def get_expected_scopes_and_publishing(csv_token, figma_var):
    """
    Determine expected scopes and hiddenFromPublishing for a token based on scoping rules.
    Returns (expected_scopes, scope_mode, expected_hidden, rule_name) or (None, None, None, None) if no rule applies.
    scope_mode is either 'equal' or 'include'.
    """
    full_token = csv_token["full_token"]
    figma_name = figma_var["name"]
    collection = figma_var.get("collection", "")

    # Determine token type from the first segment after 'affirm.'
    token_parts = full_token.split(".")
    # token_parts[0] = 'affirm', [1] = type (color, spacing, radius, size, position)
    token_type = token_parts[1] if len(token_parts) > 1 else ""

    if token_type == "color":
        if "/text/" in figma_name:
            return ["TEXT_FILL"], "equal", True, "color /text/ -> scopes must equal [TEXT_FILL]"
        elif "/icon/" in figma_name:
            return ["SHAPE_FILL"], "include", True, "color /icon/ -> scopes must include [SHAPE_FILL]"
        elif "/bg/" in figma_name:
            return ["FRAME_FILL", "SHAPE_FILL"], "equal", True, "color /bg/ -> scopes must equal [FRAME_FILL, SHAPE_FILL]"
        elif "/border/" in figma_name:
            return ["STROKE_COLOR"], "equal", True, "color /border/ -> scopes must equal [STROKE_COLOR]"
        elif "/outline/" in figma_name:
            return ["STROKE_COLOR"], "equal", True, "color /outline/ -> scopes must equal [STROKE_COLOR]"

    elif token_type == "spacing" or collection == "spacing" or figma_name.startswith("spacing/"):
        return ["GAP"], "equal", True, "spacing -> scopes must equal [GAP]"

    elif token_type == "radius" or figma_name.startswith("radius/"):
        return ["CORNER_RADIUS"], "equal", None, "radius -> scopes must equal [CORNER_RADIUS]"

    elif token_type == "size":
        if "/border/" in figma_name or "/outline/" in figma_name:
            return ["STROKE_FLOAT"], "equal", True, "size /border/ or /outline/ -> scopes must equal [STROKE_FLOAT]"
        else:
            return ["WIDTH_HEIGHT"], "equal", True, "size dimension -> scopes must equal [WIDTH_HEIGHT]"

    elif token_type == "position":
        return None, None, None, "position - no specific scoping rule"

    return None, None, None, None


def task2_scoping(matched_pairs):
    """
    Perform Task 2: Scoping rules evaluation on matched tokens.
    Returns a list of scoping issues.
    """
    issues = []

    for csv_token, figma_var in matched_pairs:
        expected_scopes, scope_mode, expected_hidden, rule_name = get_expected_scopes_and_publishing(csv_token, figma_var)

        if rule_name and "no specific scoping rule" in rule_name:
            continue

        if expected_scopes is None and expected_hidden is None and rule_name is None:
            continue

        actual_scopes = sorted(figma_var.get("scopes", []))
        expected_scopes_sorted = sorted(expected_scopes) if expected_scopes else []
        actual_hidden = figma_var.get("hiddenFromPublishing", False)

        # Check scopes based on mode
        if scope_mode == "include":
            scope_ok = all(s in actual_scopes for s in expected_scopes_sorted)
        else:  # "equal"
            scope_ok = actual_scopes == expected_scopes_sorted

        hidden_ok = True
        if expected_hidden is not None:
            hidden_ok = actual_hidden == expected_hidden

        if not scope_ok or not hidden_ok:
            issue = {
                "csv_token": csv_token["full_token"],
                "figma_name": figma_var["name"],
                "rule": rule_name,
                "scope_mode": scope_mode,
                "expected_scopes": expected_scopes_sorted,
                "actual_scopes": actual_scopes,
                "scope_ok": scope_ok,
                "expected_hidden": expected_hidden,
                "actual_hidden": actual_hidden,
                "hidden_ok": hidden_ok,
            }
            issues.append(issue)

    return issues


# --- Step 5: Generate outputs ---

def generate_mapping_csv(csv_tokens, figma_vars, output_path):
    """Generate the token mapping CSV with strict columns: csv_token, figma_name, figma_id."""
    figma_by_exact_name = {}
    figma_by_norm_name = {}
    for var in figma_vars:
        figma_by_exact_name[var["name"]] = var
        figma_by_norm_name[normalize_name(var["name"])] = var

    rows = []
    for ct in csv_tokens:
        csv_figma_name = csv_name_to_figma_name(ct["full_token"])
        figma_var = figma_by_exact_name.get(csv_figma_name)
        if not figma_var:
            figma_var = figma_by_norm_name.get(normalize_name(csv_figma_name))

        if figma_var:
            rows.append({
                "csv_token": ct["full_token"],
                "figma_name": figma_var["name"],
                "figma_id": figma_var.get("id", ""),
            })
        else:
            rows.append({
                "csv_token": ct["full_token"],
                "figma_name": "",
                "figma_id": "",
            })

    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["csv_token", "figma_name", "figma_id"])
        writer.writeheader()
        writer.writerows(rows)

    return rows


def generate_md_report(
    csv_tokens, figma_vars,
    missing_in_figma, extra_in_figma,
    naming_discrepancies, assignment_discrepancies,
    matched_pairs, scoping_issues,
    output_path
):
    """Generate the Markdown review report."""
    total_csv = len(csv_tokens)
    total_figma_mt = len([v for v in figma_vars if COMPONENT_NAME in v["name"]])
    total_matched = len(matched_pairs)
    total_missing = len(missing_in_figma)
    total_extra = len(extra_in_figma)
    total_naming = len(naming_discrepancies)
    total_assignment = len(assignment_discrepancies)
    total_scoping = len(scoping_issues)

    lines = []
    lines.append(f"# Figma Token Review: merchant_tile")
    lines.append(f"**Date:** {TODAY}")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"| Metric | Count |")
    lines.append(f"|---|---|")
    lines.append(f"| CSV Tokens | {total_csv} |")
    lines.append(f"| Figma merchant_tile Variables | {total_figma_mt} |")
    lines.append(f"| Matched Tokens | {total_matched} |")
    lines.append(f"| Missing in Figma | {total_missing} |")
    lines.append(f"| Extra in Figma (not in CSV) | {total_extra} |")
    lines.append(f"| Naming Discrepancies | {total_naming} |")
    lines.append(f"| Assignment Discrepancies | {total_assignment} |")
    lines.append(f"| Scoping Issues | {total_scoping} |")
    lines.append("")

    # --- Task 1 ---
    lines.append("---")
    lines.append("")
    lines.append("## Task 1: CSV vs Figma Comparison")
    lines.append("")

    # Missing in Figma
    lines.append("### Missing in Figma")
    lines.append("")
    if missing_in_figma:
        lines.append("The following CSV tokens have no matching Figma variable:")
        lines.append("")
        lines.append("| CSV Token | Expected Figma Name |")
        lines.append("|---|---|")
        for ct in missing_in_figma:
            lines.append(f"| `{ct['full_token']}` | `{csv_name_to_figma_name(ct['full_token'])}` |")
    else:
        lines.append("No missing tokens. All CSV tokens have matching Figma variables.")
    lines.append("")

    # Extra in Figma
    lines.append("### Extra in Figma (not in CSV)")
    lines.append("")
    if extra_in_figma:
        lines.append("The following Figma variables for merchant_tile are not present in the CSV:")
        lines.append("")
        lines.append("| Figma Variable Name | Collection | ID |")
        lines.append("|---|---|---|")
        for var in extra_in_figma:
            lines.append(f"| `{var['name']}` | {var.get('collection', '')} | {var.get('id', '')} |")
    else:
        lines.append("No extra tokens. All Figma merchant_tile variables are accounted for in the CSV.")
    lines.append("")

    # Naming Discrepancies
    lines.append("### Naming Discrepancies")
    lines.append("")
    if naming_discrepancies:
        lines.append("The following tokens have name differences between CSV and Figma (matched by normalized name):")
        lines.append("")
        lines.append("| CSV Token | Expected Figma Name | Actual Figma Name | Issue |")
        lines.append("|---|---|---|---|")
        for nd in naming_discrepancies:
            lines.append(f"| `{nd['csv_token']}` | `{nd['csv_figma_name']}` | `{nd['figma_name']}` | {nd['issue']} |")
    else:
        lines.append("No naming discrepancies found.")
    lines.append("")

    # Assignment Discrepancies
    lines.append("### Assignment Discrepancies")
    lines.append("")
    if assignment_discrepancies:
        lines.append("The following tokens have value assignment mismatches between CSV and Figma:")
        lines.append("")
        lines.append("| CSV Token | Mode | CSV Value | Figma Value |")
        lines.append("|---|---|---|---|")
        for ad in assignment_discrepancies:
            lines.append(f"| `{ad['csv_token']}` | {ad['mode']} | `{ad['csv_value']}` | `{ad['figma_value']}` |")
    else:
        lines.append("No assignment discrepancies. All matched token values align between CSV and Figma.")
    lines.append("")

    # --- Task 2 ---
    lines.append("---")
    lines.append("")
    lines.append("## Task 2: Scoping Rules Evaluation")
    lines.append("")

    if scoping_issues:
        lines.append(f"**{total_scoping} issue(s) found** in scoping/publishing configuration:")
        lines.append("")

        for si in scoping_issues:
            lines.append(f"#### `{si['figma_name']}`")
            lines.append("")
            lines.append(f"- **CSV Token:** `{si['csv_token']}`")
            lines.append(f"- **Rule:** {si['rule']}")
            if not si["scope_ok"]:
                lines.append(f"- **Scopes Issue:** Expected `{si['expected_scopes']}`, got `{si['actual_scopes']}`")
            if not si["hidden_ok"]:
                lines.append(f"- **hiddenFromPublishing Issue:** Expected `{si['expected_hidden']}`, got `{si['actual_hidden']}`")
            lines.append("")
    else:
        lines.append("All matched tokens pass their scoping rules. No issues found.")
        lines.append("")

    # --- Scoping rules reference ---
    lines.append("---")
    lines.append("")
    lines.append("## Scoping Rules Reference")
    lines.append("")
    lines.append("| Token Pattern | Expected Scopes | hiddenFromPublishing |")
    lines.append("|---|---|---|")
    lines.append("| color with `/text/` | `[TEXT_FILL]` | `true` |")
    lines.append("| color with `/icon/` | includes `[SHAPE_FILL]` | `true` |")
    lines.append("| color with `/bg/` | `[FRAME_FILL, SHAPE_FILL]` | `true` |")
    lines.append("| color with `/border/` | `[STROKE_COLOR]` | `true` |")
    lines.append("| color with `/outline/` | `[STROKE_COLOR]` | `true` |")
    lines.append("| spacing | `[GAP]` | `true` |")
    lines.append("| radius | `[CORNER_RADIUS]` | not checked |")
    lines.append("| size with `/border/` or `/outline/` | `[STROKE_FLOAT]` | `true` |")
    lines.append("| size (dimensions) | `[WIDTH_HEIGHT]` | `true` |")
    lines.append("| position | no specific rule | - |")
    lines.append("")

    # Token mapping reference
    lines.append("---")
    lines.append("")
    lines.append("## Token Mapping")
    lines.append("")
    lines.append(f"The full CSV-to-Figma token mapping is in `results/figma-token-mapping-{TODAY}.csv`.")
    lines.append("")

    with open(output_path, "w") as f:
        f.write("\n".join(lines))


# --- Main ---

def main():
    print("Reading inputs...")
    csv_tokens = read_csv_tokens(CSV_PATH)
    figma_vars = read_figma_variables(JSON_PATH)

    print(f"  CSV tokens: {len(csv_tokens)}")
    print(f"  Figma variables: {len(figma_vars)}")
    print(f"  Figma merchant_tile variables: {len([v for v in figma_vars if COMPONENT_NAME in v['name']])}")

    print("\nRunning Task 1: CSV vs Figma comparison...")
    missing_in_figma, extra_in_figma, naming_discrepancies, assignment_discrepancies, matched_pairs = task1_comparison(csv_tokens, figma_vars)

    print(f"  Matched: {len(matched_pairs)}")
    print(f"  Missing in Figma: {len(missing_in_figma)}")
    print(f"  Extra in Figma: {len(extra_in_figma)}")
    print(f"  Naming discrepancies: {len(naming_discrepancies)}")
    print(f"  Assignment discrepancies: {len(assignment_discrepancies)}")

    print("\nRunning Task 2: Scoping rules evaluation...")
    scoping_issues = task2_scoping(matched_pairs)
    print(f"  Scoping issues: {len(scoping_issues)}")

    print(f"\nGenerating outputs...")
    generate_mapping_csv(csv_tokens, figma_vars, CSV_OUTPUT)
    print(f"  Written: {CSV_OUTPUT}")

    generate_md_report(
        csv_tokens, figma_vars,
        missing_in_figma, extra_in_figma,
        naming_discrepancies, assignment_discrepancies,
        matched_pairs, scoping_issues,
        MD_OUTPUT,
    )
    print(f"  Written: {MD_OUTPUT}")

    print("\nDone!")


if __name__ == "__main__":
    main()
