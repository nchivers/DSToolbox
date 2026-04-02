# Component Property Naming Rules

These rules apply to **variant**, **boolean**, **content swap**, and **text** properties on component sets. They do **not** cover variable/token naming or whether design properties (gap, color, etc.) use tokens—that is handled in other checks.

The implementation review skill uses this file to validate that component properties and their values are named correctly.

# **Global Naming Rules (All Property Types)**

## **Formatting**

- Use **Title Case** for all property names and values
    - Size, Tone, Has Icon, Swap Leading
- Use **spaces**, not slashes, pipes, or punctuation
- **Never use emojis** in property names or values
- Keep names **short and specific** (1–3 words preferred)
- Avoid implementation language (isDisabled, slot1, showIconLeft)
- Avoid vague terms (Style, Option, Type)

## **Naming Philosophy**

Property names should:

- Reflect **user-facing meaning**
- Match vocabulary used in documentation
- Match terminology used in engineering when possible
- Be consistent across all components

If a word means something in one component, it should mean the same thing everywhere.

# **Variant Properties**

Variant properties represent **finite, system-controlled choices** like size, tone, emphasis, layout, state, etc.

## **Naming Rules**

- Use a **noun** for the property name
    - Size, Tone, Emphasis, Interaction
- Avoid naming the property like a value

## **Value Naming Rules**

- Use clear, semantic values
    - Primary, Secondary, Tertiary
    - Small, Medium, Large
    - Default, Inverse
- Include a clear default when applicable (Default)

## Specific Rules

- Use ‘Interaction’ instead of ‘State’ for variants that differ based on interaction.
    - This aligns better with the component-specific naming structure.
- For interactive elements that can be disabled, ‘Disabled’ should be a value in the ‘Interaction’ property, not a boolean like variant.
- For boolean like variants, use values True/False to allow designers to toggle into a variant. Ex: Interactive elements that can error, may have a boolean named ‘Error’ that has values ‘True’ and ‘False’.

# **Boolean Properties**

Boolean properties control **presence or absence** of an element. Implementation wise, a boolean or a variant property may be used to the same effect as long as the values for the variant are true/false.

## **Naming Rules**

- Must start with **“Has”,** not “Is” or “Show”
- Format: Has + Noun
- Avoid negative phrasing. EX: Has No Icon

### **Examples**

- Has Icon
- Has Helper Text
- Has Divider
- Has Badge

## Value Naming Rules

- Can only be true/false.

# **Text Properties**

Text properties are for **editable content fields**.

## **Naming Rules**

- Use the **role of the text**, not its position
- Avoid generic names

### **Examples**

- Label
- Helper Text
- Supporting Text
- Placeholder
- Value

Avoid:

- Text 1
- Top Text
- String

## Specific Rules

- If text is optional, pair with a boolean:
    - Has Helper Text
    - Helper Text
- Do not encode writing guidance in the name (EX: Short Label)

# **Content Swap Properties**

Content swap properties define **replaceable slots** inside components.

## **Naming Rules**

- Must start with **“Swap”**
- Format: Swap + Slot Name
- Prefer directionally safe language: Start / End instead of Left / Right

### **Examples**

- Swap Icon
- Swap Media
- Swap Badge

## **Value Rules**

- Always include None if optional
- Curate allowed swap components
- Avoid “anything goes” slots

# **Property Panel Order Standard**

All components should follow this property order:

1. Core Variants
    - Size
    - Emphasis
    - State
    - Interaction
2. Layout Variants
    - Layout
    - Alignment

After all variant properties, order the remaining properties according to where the elements of the component they belong to appear in the component’s layout following a top to bottom, left to right approach.

Boolean properties should be organized to precede any content swap or text properties they pertain to.

## Summary for the reviewer

When evaluating "names and values follow defined rules," the agent should consistently apply all rules states in this document.

Report any component property (variant, boolean, content swap, or text) whose **name** or **value** does not match these rules. Do not use this file to validate variable/token names or token usage on fills, spacing, etc.
