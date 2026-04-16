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
- For the final build/run steps (`pnpm install`, `prebuild:clean`, `ios`, `android`), ask the user which platform(s) they want to test.

---

## Completion

Once all tasks from the guide are confirmed:
- Let the user know the UX mobile development environment is fully set up.
- Tell them they can start the dev server with `pnpm --filter mobile dev` from the ux repo.
- Remind them that the UX repo is located at `../ux` relative to the DSToolbox workspace.
