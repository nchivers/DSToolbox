# Color Assignment Patterns

Repeatable base-token assignments for component color tokens. Use this file to determine the correct `base.color.*` value when reviewing Light Mode and Dark Mode columns in the component-tokens CSV.

---

## 1. Standard BG, Border, Text Combos

These assignments apply to non-interactive, display-only parts of components (containers, labels, titles, subtitles).

### Primary Variants

The default surface — white in light, near-black in dark.

| Element            | Light Mode                | Dark Mode                 |
|--------------------|---------------------------|---------------------------|
| Border             | `base.color.gray.150`     | `base.color.gray.650`     |
| Background         | `base.color.gray.white`   | `base.color.gray.950`     |
| Primary Text       | `base.color.gray.950`     | `base.color.gray.white`   |
| Supplementary Text | `base.color.gray.500`     | `base.color.gray.450`     |

### Secondary Variants

A slightly tinted surface sitting below the primary surface.

| Element            | Light Mode                | Dark Mode                 |
|--------------------|---------------------------|---------------------------|
| Border             | `base.color.gray.150`     | `base.color.gray.650`     |
| Background         | `base.color.gray.020`     | `base.color.gray.900`     |
| Primary Text       | `base.color.gray.950`     | `base.color.gray.white`   |
| Supplementary Text | `base.color.gray.500`     | `base.color.gray.450`     |

### Tertiary Variants

A more prominent tinted surface.

| Element            | Light Mode                | Dark Mode                 |
|--------------------|---------------------------|---------------------------|
| Border             | `base.color.gray.150`     | `base.color.gray.650`     |
| Background         | `base.color.gray.050`     | `base.color.gray.800`     |
| Primary Text       | `base.color.gray.950`     | `base.color.gray.white`   |
| Supplementary Text | `base.color.gray.500`     | `base.color.gray.450`     |

### Summary — what stays constant across variants

- **Border** is always `gray.150` (light) / `gray.650` (dark).
- **Primary Text** is always `gray.950` (light) / `gray.white` (dark).
- **Supplementary Text** is always `gray.500` (light) / `gray.450` (dark).
- Only **Background** changes per variant:
  - Primary → `gray.white` / `gray.950`
  - Secondary → `gray.020` / `gray.900`
  - Tertiary → `gray.050` / `gray.800`

---

## 2. Interactives

These assignments apply to interactive (form) controls such as dropdowns, text inputs, and similar components. The left column is the light-mode value and the right column is the dark-mode value.

### Resting States

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Border          | `base.color.gray.400`     | `base.color.gray.450`     |
| Background      | `base.color.gray.white`   | `base.color.gray.950`     |
| Value Text      | `base.color.gray.950`     | `base.color.gray.white`   |
| Label & Message | `base.color.gray.500`     | `base.color.gray.350`     |

### Hover States

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Background      | `base.color.indigo.050`   | `base.color.gray.850`     |

### Pressed States

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Background      | `base.color.indigo.075`   | `base.color.gray.800`     |

### Focus-Visible States

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Outline         | `base.color.indigo.500`   | `base.color.indigo.500`   |
| Background      | `base.color.indigo.050`   | `base.color.gray.850`     |

### Disabled States

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Border          | `base.color.gray.150`     | `base.color.gray.650`     |
| Background      | `base.color.gray.100`     | `base.color.gray.750`     |
| Value Text      | `base.color.gray.300`     | `base.color.gray.500`     |
| Label & Message | `base.color.gray.300`     | `base.color.gray.500`     |

---

## 3. Error States

Error states replace the border and message colors with red, while preserving the standard text and background assignments.

### Error — Resting

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Border          | `base.color.red.600`      | `base.color.red.300`     |
| Background      | `base.color.gray.white`   | `base.color.gray.950`     |
| Value Text      | `base.color.gray.950`     | `base.color.gray.white`     |
| Label & Message | `base.color.red.600`      | `base.color.red.300`     |

### Error — Hover

Background shifts to the error hover tint noted below. Border and message remain as defined in Error-Resting.

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Background      | `base.color.red.050`      | `base.color.gray.850`     |


### Error — Pressed

Background shifts to the error pressed tint noted below. Border and message remain as defined in Error-Resting.

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Background      | `base.color.red.100`      | `base.color.gray.800`     |


### Error — Focus-Visible

Background shifts to the error focus-visible tint noted below. Border and message remain as defined in Error-Resting.

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Background      | `base.color.red.050`      | `base.color.gray.850`     |

---

## 4. Focus States (Text Input, Search, Text Area)

Text input focus uses a dedicated set of assignments. Border color changes and a cursor color appears.

| Element         | Light Mode                | Dark Mode                 |
|-----------------|---------------------------|---------------------------|
| Border          | `base.color.indigo.900`   | `base.color.indigo.200`   |
| Background      | `base.color.gray.white`   | `base.color.gray.950`     |
| Value Text      | `base.color.gray.950`     | `base.color.gray.white`   |
| Label & Icons   | `base.color.indigo.900`   | `base.color.indigo.200`   |
| Cursor          | `base.color.indigo.500`   | `base.color.indigo.500`   |
| Message         | `base.color.gray.500`     | `base.color.gray.350`     |

---

## 5. Quick-Reference Patterns

### Text color

| Text role           | Light Mode              | Dark Mode               |
|---------------------|-------------------------|-------------------------|
| Primary / Value     | `base.color.gray.950`   | `base.color.gray.white` |
| Supplementary       | `base.color.gray.500`   | `base.color.gray.350`   |
| Label & Message     | `base.color.gray.500`   | `base.color.gray.350`   |
| Disabled text       | `base.color.gray.300`   | `base.color.gray.500`   |
| Error message       | `base.color.red.600`    | `base.color.red.300`    |

### Border color

| Context              | Light Mode              | Dark Mode               |
|----------------------|-------------------------|-------------------------|
| Standard (display)   | `base.color.gray.150`   | `base.color.gray.650`   |
| Interactive resting  | `base.color.gray.400`   | `base.color.gray.450`   |
| Disabled             | `base.color.gray.150`   | `base.color.gray.650`   |
| Error                | `base.color.red.600`    | `base.color.red.300`    |

### Background color

| Context              | Light Mode                | Dark Mode                 |
|----------------------|---------------------------|---------------------------|
| Primary surface      | `base.color.gray.white`   | `base.color.gray.950`     |
| Secondary surface    | `base.color.gray.020`     | `base.color.gray.900`     |
| Tertiary surface     | `base.color.gray.050`     | `base.color.gray.800`     |
| Interactive resting  | `base.color.gray.white`   | `base.color.gray.950`     |
| Hover                | `base.color.indigo.050`   | `base.color.gray.850`     |
| Pressed              | `base.color.indigo.075`   | `base.color.gray.800`     |
| Focus-visible        | `base.color.indigo.050`   | `base.color.gray.850`     |
| Disabled             | `base.color.gray.100`     | `base.color.gray.750`     |

### Outline color

| Context              | Light Mode                | Dark Mode                 |
|----------------------|---------------------------|---------------------------|
| Focus-visible        | `base.color.indigo.500`   | `base.color.indigo.500`   |
| Error focus-visible  | `base.color.indigo.500`   | `base.color.indigo.500`   |
