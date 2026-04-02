# DS Toolbox

A set of AI-powered tools for running quality checks on design system work before submitting for review or signing off on QA.

---

## Table of Contents

- [Setup](#setup) _(one-time)_
- [Install the Figma Plugin](#install-the-figma-plugin)
- [Token Review](#token-review)
- [Figma Variables Review](#figma-variables-review)
- [Figma Component Review](#figma-component-review)
- [Code QA](#code-qa)
- [Repo Structure](#repo-structure)

---

## Setup

> This only needs to be done once.

1. **Install Cursor**

   1.1 Open **Affirm Staff Self Service**, search for **Cursor**, download, and install it.

   1.2 Open Cursor. Create an account if prompted, or sign in if you already have one.

2. **Create / Sign In to Claude**

   2.1 Using Okta, search for **"Claude Code Console"** and select it, **or** go to [platform.claude.com](https://platform.claude.com).

   2.2 Enter your `affirm.com` email and click the **SSO** button, then follow the Okta prompts.

3. **Install Claude Code**

   3.1 In Cursor, open a new terminal (**Terminal > New Terminal**) and run:
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   3.2 Allow/accept any prompts until complete. Then verify the installation:
   ```bash
   claude --version
   ```
   You should see a version number returned.

   3.3 Launch Claude:
   ```bash
   claude
   ```

   3.4 Choose your preferred style when prompted.

   3.5 For login method, select: **2. Anthropic Console account • API usage billing**

   3.6 A browser window will open — click **Authorize** to connect Claude Code to your Anthropic organization.

   3.7 Back in the terminal, press **Enter** when prompted, then accept the security notice.

   3.8 On "Use Claude Code's terminal setup", select **1. Yes, use recommended settings**.

   3.9 On "Accessing workspace", select **1. Yes, I trust this folder**.

4. **Download the DS Toolbox Repo**

   4.1 On your computer, create a folder called `Projects` (a good location is alongside your Documents, Downloads, and Pictures folders in your user directory).

   4.2 Right-click the `Projects` folder and choose **New Terminal at Folder**.

   4.3 Run the following command:
   ```bash
   git clone https://github.com/nchivers/DSToolbox.git && cursor DSToolbox
   ```
   This clones the repo into `Projects/DSToolbox` and opens it in Cursor. The folder stays connected to GitHub so you can pull updates as they roll out.

5. **Set Up Connections**

   5.1 With the DSToolbox folder open in Cursor, open a new terminal (**Terminal > New Terminal**) and run:
   ```bash
   claude
   ```

   5.2 Run the setup command:
   ```
   /ds-toolbox-setup
   ```

   5.3 Follow the prompts Claude provides to install and configure all required connections and tools.

---

## Install the Figma Plugin

The Figma plugin exports all variables from a library branch — required for a number of tools.

1. Open **Figma Desktop**.
2. Go to **Plugins → Development → Import plugin from manifest…**
3. Navigate into the `plugin` folder inside DSToolbox.
4. Select `manifest.json`.

You should now see the **Export Variables to JSON** plugin under **Plugins > Development**.

---

## Token Review

**Purpose:** Ensure tokens follow defined naming rules and patterns, catch missing assignments, and surface potentially missing tokens.

**When to run:** After creating your tokens in the Google Sheet, but _before_ branching the DS library or implementing them as Figma variables.

### Steps

1. Copy all of your tokens (including column headers) into a new Google Sheet.
   > **Tip:** Use `cmd + shift + v` to paste values only, without data validations or formatting.

2. Download the sheet as a CSV: **File > Download > Comma Separated Values (.csv)**

3. Open the downloaded CSV in Cursor.

4. Copy the contents and paste them into `inputs/component-tokens.csv`.
   > **Tip:** If the file explorer isn't visible, enable it via **View > Explorer**.

5. Save the file (`cmd + s`).

6. Open `inputs/inputs.json` and set the `componentName` property:
   ```json
   "componentName": "accordion"
   ```

7. Save the file (`cmd + s`).

8. In the terminal, start or resume Claude:

   8.1 **If Claude is not running:** type `claude` then press Enter.

   8.2 **If Claude is already running:** type `/clear` then press Enter.

9. Run the review:
   ```
   /ds-toolbox token review
   ```

10. Wait for Claude to finish. Grant any permissions it requests as long as they look safe.

11. Review the output file in `outputs/0-review/`.

12. Make corrections in your spreadsheet and re-run from step 1 until you are satisfied.

Once happy with the result, submit your spreadsheet for review.

---

## Figma Variables Review

**Purpose:** Ensure tokens from your spreadsheet have been accurately translated into Figma variables — correctly scoped, hidden from publishing where appropriate, and assigned the right values.

**When to run:** After your spreadsheet tokens are approved, you've created your library branch in Figma, and you've fully translated your tokens into Figma variables.

### Steps

**If your tokens have changed since your last CSV download:**

1. Copy all tokens (including headers) into a new Google Sheet.
2. Download as CSV: **File > Download > Comma Separated Values (.csv)**
3. Open the CSV in Cursor, copy its contents, and paste into `inputs/component-tokens.csv`.
4. Save (`cmd + s`).

_If tokens haven't changed, you can reuse the previous download and skip to step 5._

5. In Figma Desktop, ensure you are in the correct branch.

6. Open the plugin: **Plugins > Development > Export Variables to JSON**

7. Click **Export Variables**, then once the variables appear, click **Copy JSON**.

8. Open `inputs/figma-variables.json` in Cursor, select all (`cmd + a`), delete, and paste the copied JSON.

9. Save (`cmd + s`).

10. Open `inputs/inputs.json` and set `componentName`:
    ```json
    "componentName": "accordion"
    ```

11. Save (`cmd + s`).

12. In the terminal, start or resume Claude:

    12.1 **If Claude is not running:** type `claude` then press Enter.

    12.2 **If Claude is already running:** type `/clear` then press Enter.

13. Run the review:
    ```
    /ds-toolbox figma variables review
    ```

14. Wait for Claude to finish. Grant any permissions it requests as long as they look safe.

15. Review the output file in `outputs/1-review/`.

16. Make corrections in your branch or spreadsheet as needed.

17. Re-run from step 1 if you changed the spreadsheet, or from step 5 if you only changed Figma variables.

Once happy with the result, move on to implementing your component changes and applying your variables, then run Review 2.

---

## Figma Component Review

**Purpose:** Ensure variables are correctly applied to your component, no raw hex/values are used where they shouldn't be, typography uses library styles, and component properties follow defined rules.

**When to run:** After spreadsheet approval, your library branch is created, variables are fully translated, the component is implemented, and variables are applied.

### Steps

1. **Run Review 1 first.** Review 1 outputs `inputs/mapped-component-tokens.csv`, which Review 2 depends on.

2. In Figma, in your branch, select the component or component set (purple border) and copy the link to the node:

   2.1 Press `cmd + L`, or go to **Share > Copy link**.

3. Open `inputs/inputs.json` and paste the link into `componentUrl`:
   ```json
   "componentUrl": "https://www.figma.com/design/..."
   ```

4. Save (`cmd + s`).

5. In the terminal, start or resume Claude:

   5.1 **If Claude is not running:** type `claude` then press Enter.

   5.2 **If Claude is already running:** type `/clear` then press Enter.

6. Run the review:
   ```
   /ds-toolbox figma component review
   ```

7. Wait for Claude to finish. Grant any permissions it requests as long as they look safe.

8. Review the output file in `outputs/2-review/`.

9. Make corrections in your branch or spreadsheet as needed.

10. Re-run from step 1 if you changed the spreadsheet or Figma variables, or from step 5 if you only changed the component.

Once happy with the result, submit your branch for review.

---

## Code QA

**Purpose:** Ensure tokens are properly named, assigned correct values, and correctly applied to the component in the PR you are reviewing.

**When to run:** Once your engineer notifies you that the PR is ready for your review.

### Steps

**If your tokens have changed since your last CSV download:**

1. Copy all tokens (including headers) into a new Google Sheet.
2. Download as CSV: **File > Download > Comma Separated Values (.csv)**
3. Open the CSV in Cursor, copy its contents, and paste into `inputs/component-tokens.csv`.
4. Save (`cmd + s`).

_If tokens haven't changed, you can reuse the previous download and skip to step 5._

5. Open `inputs/inputs.json` and set `componentName`:
   ```json
   "componentName": "accordion"
   ```

6. Paste the GitHub PR link from your engineering partner into `pullRequestUrl`:
   ```json
   "pullRequestUrl": "https://github.com/..."
   ```

7. Save (`cmd + s`).

8. In the terminal, start or resume Claude:

   8.1 **If Claude is not running:** type `claude` then press Enter.

   8.2 **If Claude is already running:** type `/clear` then press Enter.

9. Run the QA:
   ```
   /ds-toolbox code qa
   ```

10. Wait for Claude to finish. Grant any permissions it requests as long as they look safe.

11. Review the output file in `outputs/3-code-qa/`.

12. Work with your engineer to correct any issues.

13. Re-run from the appropriate step depending on what changed.

Once happy with the result, continue with the visual QA step using the simulator and inspect tools.

---

## Repo Structure

```
DSToolbox/
├── inputs/
│   ├── component-tokens.csv       # Paste your token CSV here
│   ├── figma-variables.json       # Paste your Figma JSON export here
│   ├── inputs.json                # Set componentName, componentUrl, pullRequestUrl here
│   └── mapped-component-tokens.csv  # Auto-generated by Review 1; used by Review 2
├── outputs/
│   ├── 0-review/                  # Review 0 output files
│   ├── 1-review/                  # Review 1 output files
│   ├── 2-review/                  # Review 2 output files
│   └── 3-code-qa/                 # QA 1 output files
├── plugin/                        # Figma plugin source (Export Variables to JSON)
└── tools/                         # Claude skill definitions for each review/QA tool
```
