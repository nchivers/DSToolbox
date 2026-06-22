# DS Toolbox

A set of AI-powered tools for running quality checks on design system work before submitting for review or signing off on QA.

---

## Table of Contents

- [Setup](#setup) _(one-time)_
- [Install the Figma Plugin](#install-the-figma-plugin)
- [Token Review](#token-review)
- [Token Prep](#token-prep)
- [Build Figma Variables](#build-figma-variables)
- [Figma Variables Review](#figma-variables-review)
- [Figma Component Review](#figma-component-review)
- [QA Code Tokens](#qa-code-tokens)
- [QA Storybook](#qa-storybook)
- [Publish Prep](#publish-prep)
- [Mobile Setup](#mobile-setup) _(one-time, QA Storybook only)_
- [Admin](#admin)
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

6. **Install Figma Plugin**

   6.1 Open **Figma Desktop**.
   6.2 Go to **Plugins → Development → Import plugin from manifest…**
   6.3 Navigate into the `plugin` folder inside DSToolbox.
   6.4 Select `manifest.json`.

   You should now see the **Export Variables to JSON** plugin under **Plugins > Development**.

---

## Token Review

**Purpose:** Ensure tokens follow defined naming rules and patterns, catch missing assignments, and surface potentially missing tokens.

**When to run:** After creating your tokens in the Google Sheet, but _before_ branching the DS library or implementing them as Figma variables.

### Steps

1. Copy all of your tokens into a new Google Sheet.
   > [Here is a template for you to use that already has the headers in it.](https://docs.google.com/spreadsheets/d/1QnpCxmFz7BCtsF37fG0syW7ba5pu0bD8AQCa_Rtm9LU/edit?usp=sharing)
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

## Token Prep

**Purpose:** Analyse your approved token CSV against the current Figma variables and produce a structured plan of every change needed — value updates, renames, deletions, and additions — before touching Figma.

**When to run:** After your spreadsheet tokens are approved and you are ready to update the DS library in Figma, but _before_ making any changes in Figma.

### Steps

**If your tokens have changed since your last CSV download:**

1. Copy all tokens into a new Google Sheet.
   > [Here is a template for you to use that already has the headers in it.](https://docs.google.com/spreadsheets/d/1QnpCxmFz7BCtsF37fG0syW7ba5pu0bD8AQCa_Rtm9LU/edit?usp=sharing)
   > **Tip:** Use `cmd + shift + v` to paste values only, without data validations or formatting.
2. Download as CSV: **File > Download > Comma Separated Values (.csv)**
3. Open the CSV in Cursor, copy its contents, and paste into `inputs/component-tokens.csv`.
4. Save (`cmd + s`).

_If tokens haven't changed, you can reuse the previous download and skip to step 5._

5. In Figma Desktop, open the main DS library file (not a branch).

6. Open the plugin: **Plugins > Development > Export Variables to JSON**

7. Click **Export Variables**, then once the variables appear, click **Copy JSON**.

8. Open `inputs/figma-variables.json` in Cursor, select all (`cmd + a`), delete, and paste the copied JSON.

9. Save (`cmd + s`).

10. Confirm `inputs/inputs.json` has the correct `componentName`:
    ```json
    "componentName": "accordion"
    ```

11. Save (`cmd + s`).

12. In the terminal, start or resume Claude:

    12.1 **If Claude is not running:** type `claude` then press Enter.

    12.2 **If Claude is already running:** type `/clear` then press Enter.

13. Run the prep:
    ```
    /ds-toolbox token prep
    ```

14. Wait for Claude to finish. Grant any permissions it requests as long as they look safe.

15. Review the output plan in `outputs/1-token-prep/`. Check the suggested changes carefully — especially any low-confidence renames — and make corrections to `inputs/build-figma-variables-plan.md` before proceeding.

Once happy with the plan, move on to Build Figma Variables.

---

## Build Figma Variables

**Purpose:** Apply the changes from your Token Prep plan to the DS library in Figma — creating, updating, renaming, and deleting variables on a new branch — using the Figma MCP connection.

**When to run:** After you have reviewed and approved the Token Prep plan.

### Steps

1. In Figma Desktop, create a new branch from the DS library main file.

2. Copy the link to your new branch: open the branch, then go to **Share > Copy link** (or press `cmd + L`).

3. Open `inputs/inputs.json` and paste the branch link into `libraryBranchUrl`:
   ```json
   "libraryBranchUrl": "https://www.figma.com/design/..."
   ```

4. Save (`cmd + s`).

5. In the terminal, start or resume Claude:

   5.1 **If Claude is not running:** type `claude` then press Enter.

   5.2 **If Claude is already running:** type `/clear` then press Enter.

6. Run the build:
   ```
   /ds-toolbox build figma variables
   ```

7. Wait for Claude to finish. Grant any permissions it requests as long as they look safe.

8. Review the output summary in `outputs/2-build-figma-variables/`.

9. Check your branch in Figma to confirm the variables look correct.

Once happy, move on to Figma Variables Review to verify the result.

---

## Figma Variables Review

**Purpose:** Ensure tokens from your spreadsheet have been accurately translated into Figma variables — correctly scoped, hidden from publishing where appropriate, and assigned the right values.

**When to run:** After your Build Figma Variables step is complete and the variables are on the branch.

### Steps

**If your tokens have changed since your last CSV download:**

1. Copy all tokens into a new Google Sheet.
   > [Here is a template for you to use that already has the headers in it.](https://docs.google.com/spreadsheets/d/1QnpCxmFz7BCtsF37fG0syW7ba5pu0bD8AQCa_Rtm9LU/edit?usp=sharing)
   > **Tip:** Use `cmd + shift + v` to paste values only, without data validations or formatting.
2. Download as CSV: **File > Download > Comma Separated Values (.csv)**
3. Open the CSV in Cursor, copy its contents, and paste into `inputs/component-tokens.csv`.
4. Save (`cmd + s`).

_If tokens haven't changed, you can reuse the previous download and skip to step 5._

5. In Figma Desktop, ensure you are in the correct branch.

6. Open the plugin: **Plugins > Development > Export Variables to JSON**

7. Click **Export Variables**, then once the variables appear, click **Copy JSON**.

8. Open `inputs/figma-variables.json` in Cursor, select all (`cmd + a`), delete, and paste the copied JSON.

9. Save (`cmd + s`).

10. Open `inputs/inputs.json` and confirm `componentName`:
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

Once happy with the result, move on to implementing your component changes and applying your variables, then run Figma Component Review.

---

## Figma Component Review

**Purpose:** Ensure variables are correctly applied to your component, no raw hex/values are used where they shouldn't be, typography uses library styles, and component properties follow defined rules.

**When to run:** After the Figma Variables Review is complete, the component is implemented, and variables are applied.

### Steps

1. **Run Figma Variables Review first.** It outputs `inputs/mapped-component-tokens.csv`, which this tool depends on.

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

## QA Code Tokens

**Purpose:** Ensure tokens are properly named, assigned correct values, and correctly applied to the component in the PR you are reviewing.

**When to run:** Once your engineer notifies you that the PR is ready for your review.

### Steps

**If your tokens have changed since your last CSV download:**

1. Copy all tokens into a new Google Sheet.
   > [Here is a template for you to use that already has the headers in it.](https://docs.google.com/spreadsheets/d/1QnpCxmFz7BCtsF37fG0syW7ba5pu0bD8AQCa_Rtm9LU/edit?usp=sharing)
   > **Tip:** Use `cmd + shift + v` to paste values only, without data validations or formatting.
2. Download as CSV: **File > Download > Comma Separated Values (.csv)**
3. Open the CSV in Cursor, copy its contents, and paste into `inputs/component-tokens.csv`.
4. Save (`cmd + s`).

_If tokens haven't changed, you can reuse the previous download and skip to step 5._

5. Open `inputs/inputs.json` and confirm `componentName`:
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
   /ds-toolbox qa code tokens
   ```

10. Wait for Claude to finish. Grant any permissions it requests as long as they look safe.

11. Review the output file in `outputs/3-code-qa/`.

12. Work with your engineer to correct any issues.

13. Re-run from the appropriate step depending on what changed.

Once happy with the result, continue with QA Storybook to validate the visual output on device.

---

## QA Storybook

**Purpose:** Check out the PR branch in the UX repo, perform a clean Storybook build, launch the app on your iOS Simulator or Android Emulator, and compare every variant of the component against the Figma source of truth.

**When to run:** After QA Code Tokens passes, to confirm the visual rendering on device matches the design.

> **Prerequisite:** The [Mobile Setup](#mobile-setup) must be completed before running this tool for the first time.

### Steps

1. Open `inputs/inputs.json` and confirm `componentName`, `pullRequestUrl`, and `componentUrl` are all set:
   ```json
   "componentName": "accordion",
   "pullRequestUrl": "https://github.com/...",
   "componentUrl": "https://www.figma.com/design/..."
   ```

2. Save (`cmd + s`).

3. In the terminal, start or resume Claude:

   3.1 **If Claude is not running:** type `claude` then press Enter.

   3.2 **If Claude is already running:** type `/clear` then press Enter.

4. Run the QA:
   ```
   /ds-toolbox qa storybook
   ```

5. When prompted, choose your platform: **iOS Simulator** or **Android Emulator**.

6. Wait for the build to complete and the app to launch. This step can take several minutes — Claude will notify you when the app is ready.

7. Claude will navigate the Storybook app, inspect each variant against Figma, and write findings to `outputs/7-qa-storybook/`.

8. Review the output report. Work with your engineer to address any discrepancies.

Once happy with the result, you're ready to sign off on QA.

---

## Publish Prep

**Purpose:** Before publishing the DS library, see exactly what a publish would change — which published variables, styles, and components changed since the last publish, which are new, and which would be removed — so you can review what's ready and write the library update note for the design team. For components, "changed" covers the publishable API surface (component properties, variant options, description), not internal layer structure.

**When to run:** When you are preparing to publish library changes.

> **How it works:** The baseline (last-published state) is pulled live from a **Baselining File** that subscribes to the published library, so there is no baseline file to keep in sync. You produce two JSON exports with the **DS Publish Prep Export** plugin — one for the current working state, one for the published baseline — and Claude diffs them.

### One-time setup

1. **Install the plugin.** In Figma Desktop: **Plugins → Development → Import plugin from manifest…**, then select `tools/8-publish-prep/plugin/manifest.json`. This is a separate plugin from **Export Variables to JSON** and will not conflict.

   > If the plugin has not been built yet, run it once: in a terminal, `cd tools/8-publish-prep/plugin && npm install && npm run build`.

2. **Create a Baselining File.** Make a new, empty Figma design file (name it e.g. "DS Baselining File"). Open **Assets → Libraries** and enable the published DS library in it. This file's subscribed assets represent the last-published state.

3. **Get a Figma token.** You need a Figma personal access token with `library_content:read` and `files:read` scopes (used to list published style and component keys).

### Steps

1. **Export the current state.** In Figma, open the DS library file (or your branch). Run **Plugins → Development → DS Publish Prep Export**, keep **Export Current** selected, click **Export**, then **Copy JSON**.

2. Open `inputs/library-current.json` in Cursor, select all (`cmd + a`), delete, and paste. Save (`cmd + s`).

3. **Export the baseline.** Open your **Baselining File**. Run the same plugin, choose **Export Baseline**, select the library, paste the library's **main** file key or URL (not a branch) and your Figma token, click **Export**, then **Copy JSON**.

4. Open `inputs/library-baseline.json` in Cursor, select all, delete, and paste. Save.

5. (Optional) Set `mainLibraryUrl` in `inputs/inputs.json` so it appears in the report.

6. In the terminal, start or resume Claude:

   6.1 **If Claude is not running:** type `claude` then press Enter.

   6.2 **If Claude is already running:** type `/clear` then press Enter.

7. Run the prep:
   ```
   /ds-toolbox publish prep
   ```

8. Wait for Claude to finish. Review the report in `outputs/8-publish-prep/`.

9. Use the per-item summaries to decide what's ready to publish and to write the library update note for the design team.

> **Note:** This covers variables, styles, and components/component sets. For components, the diff reports metadata and component property changes (variant options, boolean/text/instance-swap properties, defaults, description) — it does not diff internal layer structure or visual styling.

---

## Mobile Setup

> This only needs to be done once, and only if you plan to use QA Storybook.

This sets up the Affirm UX mobile development environment required to build and run the Storybook app on a simulator or emulator.

1. Complete the main [Setup](#setup) first.

2. In the terminal, start or resume Claude:

   2.1 **If Claude is not running:** type `claude` then press Enter.

   2.2 **If Claude is already running:** type `/clear` then press Enter.

3. Run the mobile setup command:
   ```
   /ds-toolbox-setup-mobile
   ```

4. Claude will read the UX repo's environment setup guide and walk you through installing all required tools. Follow the prompts — some steps require manual actions in the browser or Xcode.

5. Once complete, Claude will confirm the environment is ready and list the build commands available.

---

## Admin

Utility commands for maintaining the workspace between component reviews.

### Clean Up

Resets all input files back to their placeholder state so you can start fresh for a new component.

```
/ds-toolbox-admin clean up
```

This will:
- Reset `inputs/inputs.json` to the default template.
- Clear the contents of `inputs/component-tokens.csv`, `inputs/figma-variables.json`, `inputs/mapped-component-tokens.csv`, and `inputs/build-figma-variables-plan.md`.

### Update Base Variables

Fetches the latest local variables from the DS Base Library via the Figma REST API and overwrites `tools/knowledge/figma-base-variables.csv`.

```
/ds-toolbox-admin update base variables
```

Run this whenever base tokens in the library have changed and you need the Token Prep tool to reference the latest variable IDs.

---

## Repo Structure

```
DSToolbox/
├── inputs/
│   ├── component-tokens.csv            # Paste your token CSV here
│   ├── figma-variables.json            # Paste your Figma JSON export here
│   ├── inputs.json                     # Set componentName, URLs, and other inputs here
│   ├── build-figma-variables-plan.md   # Auto-generated by Token Prep; used by Build Figma Variables
│   ├── mapped-component-tokens.csv     # Auto-generated by Figma Variables Review; used by Figma Component Review
│   ├── library-current.json            # Paste the Publish Prep "Export Current" JSON here
│   └── library-baseline.json           # Paste the Publish Prep "Export Baseline" JSON here
├── outputs/
│   ├── 0-review/                       # Token Review output files
│   ├── 1-token-prep/                   # Token Prep output files
│   ├── 2-build-figma-variables/        # Build Figma Variables output files
│   ├── 1-review/                       # Figma Variables Review output files
│   ├── 2-review/                       # Figma Component Review output files
│   ├── 3-code-qa/                      # QA Code Tokens output files
│   ├── 7-qa-storybook/                 # QA Storybook output files
│   └── 8-publish-prep/                 # Publish Prep output files
├── plugin/                             # Figma plugin source (Export Variables to JSON)
└── tools/                              # Skill definitions for each tool
    ├── 0-token-review/                 # Token Review skill
    ├── 1-token-prep/                   # Token Prep skill
    ├── 2-build-figma-variables/        # Build Figma Variables skill
    ├── 3-figma-variables-review/       # Figma Variables Review skill
    ├── 4-figma-component-review/       # Figma Component Review skill
    ├── 6-qa-code-tokens/               # QA Code Tokens skill
    ├── 7-qa-storybook/                 # QA Storybook skill
    ├── 8-publish-prep/                 # Publish Prep skill (+ standalone plugin, diff script)
    └── knowledge/                      # Shared naming rules, scoping rules, and base variable lookup
```
