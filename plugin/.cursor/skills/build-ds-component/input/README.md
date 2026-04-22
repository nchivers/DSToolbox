# Token CSV Input

Place component token CSVs in this folder before running the build-ds-component skill.

## Naming

Name each file `<ComponentName>.csv` using PascalCase that matches the `componentName` field in `input.json`.

Examples: `Button.csv`, `RadioGroup.csv`, `InputText.csv`

## Format

Each CSV should have rows with the full token path and columns for the base value assignments:

| Token path | All Modes | Light Mode | Dark Mode |
|------------|-----------|------------|-----------|
| `affirm.size.button.height` | `500` | | |
| `affirm.color.button.bg.resting` | | `indigo-950` | `indigo-300` |
| `affirm.color.button.bg.hover` | | `indigo-700` | `indigo-200` |

- **All Modes** column: mode-independent values (sizes, spacing, radius) referencing `$base-sizes` keys.
- **Light Mode** / **Dark Mode** columns: color values referencing `$base-colors` keys.

CSVs accumulate here as a historical record of token assignments per component.
