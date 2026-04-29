You are helping a user set up the Affirm UX mobile development environment. This command should be run after the `ds-toolbox-setup` command has completed.

---

## Step 1 — Clone the UX repo

Check whether `../ux` already exists (relative to this workspace root).

**If the directory exists:**
- Run `git -C ../ux remote get-url origin` to confirm it points to `https://github.com/Affirm/ux.git`.
- If it does, confirm to the user and move on.
- If the remote doesn't match, warn the user and ask how they'd like to proceed.

**If the directory does not exist:**
- Explain that you will clone the Affirm UX monorepo into the Projects folder alongside DSToolbox.
- Ask for permission, then run:
  ```
  gh repo clone Affirm/ux ../ux
  ```
- Confirm the clone succeeded by checking that `../ux/.git` exists.

---

## Step 2 — Read the environment setup guide

Fetch the official setup guide from the repo using:
```
gh api repos/Affirm/ux/contents/docs/ENVIRONMENT_SETUP.md --jq '.content' | base64 -d
```

Read the full output carefully. This is the source of truth for all remaining setup steps.

---

## Step 3 — Plan the setup

Based on the environment setup guide you just read, create a numbered plan of every setup task that needs to be completed. For each task, note:
- What it installs or configures
- What command(s) you'll need to run
- What checks you can do to see if it's already done

**Additional task — idb (iOS Device Bridge):**
If the environment setup guide does not already include installing `idb`, add it as a task in your plan. `idb` is Facebook's tool for automating iOS simulators and is required by DSToolbox skills that interact with the iOS simulator (e.g. taking screenshots, tapping elements).

- **Check:** `which idb` and `idb --help`
- **Install via Homebrew:**
  ```
  brew tap facebook/fb
  brew install idb-companion
  pip3 install fb-idb
  ```
- After installation, verify with `idb list-targets` to confirm it can see available simulators.

Present this plan to the user and ask them to confirm before proceeding.

---

## Step 4 — Execute the plan

Work through your plan one task at a time. For each task:

1. **Check first** — run read-only checks (`which`, `--version`, `ls`, `grep`, etc.) to see if the task is already complete. These checks do not require permission.
2. **Skip if done** — if a check confirms the tool/config is already in place, tell the user and move to the next task.
3. **Ask before changing** — if the task requires installing, modifying, or appending to anything, briefly explain what you're about to do and ask for permission before running it. The exception is commands that are already pre-approved in the project's `.claude/settings.local.json` — for those (`brew`, `asdf`, `pnpm`, `xcodes`, `cp`, `python`, `bash`, `sh`, `chmod`, and file read/write/edit), you can proceed without asking, but still explain what you're doing.
4. **Verify after** — confirm each task succeeded before moving on.

**Important notes for execution:**
- All commands from the setup guide should be run with the working directory set to `../ux` (the cloned repo).
- For steps that require manual user action (e.g. Android Studio GUI setup, iOS code signing, Slack channel requests, browser flows), explain what needs to be done and wait for the user to confirm before continuing.
- If `asdf install` is needed, warn the user it may take several minutes as it compiles language runtimes.
- **Stop before building.** Do not run build or run commands (`pnpm --filter mobile ios`, `pnpm --filter mobile android`, `pnpm --filter mobile dev`, `prebuild:clean`, etc.). The setup ends once all tools, dependencies, and configuration are in place.

---

## Completion

Once all setup tasks from the guide are confirmed:
- Let the user know the environment setup is complete and everything is in place to build.
- List the commands they can use when they're ready:
  - `pnpm install` — install monorepo dependencies
  - `pnpm --filter mobile prebuild:clean` — generate native project files
  - `pnpm --filter mobile ios` — build and run on iOS
  - `pnpm --filter mobile android` — build and run on Android
  - `pnpm --filter mobile dev` — start the Metro dev server (faster after first build)
- Open the UX repo in a new Cursor window by running:
  ```
  cursor ../ux
  ```
- Remind them that the new Cursor window is pointed at the UX repo, where all build commands should be run.
