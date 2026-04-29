---
name: qa-storybook
description: Checks out a PR branch in the ux repo, runs a clean Storybook dev build, and launches it on iOS simulator or Android emulator. Use when QA-ing a component PR in the mobile Storybook app.
---

# QA Storybook

Check out a pull request branch in the **ux** monorepo, perform a clean Storybook build, start the dev server, and launch the app on the user's chosen mobile platform.

---

## Inputs

Read **inputs/inputs.json** (paths relative to workspace root):

| Key | Purpose |
|-----|---------|
| `pullRequestUrl` | **Required.** Full URL to the GitHub pull request (e.g. `https://github.com/Affirm/ux/pull/42`). Used to resolve the PR head branch to check out. |

---

## Workflow

### 1. Navigate to the ux repo

All build and run commands execute in the **ux** repo located at `../ux` relative to this workspace root.

- Verify `../ux` exists and contains a `.git` directory.
- If it does not exist, **stop** and tell the user to run the `ds-toolbox-setup-mobile` command first to clone the repo.
- Use `../ux` as the working directory for all subsequent shell commands in this skill.

### 2. Resolve the PR branch

Parse `pullRequestUrl` to extract **owner**, **repo**, and **PR number** (format: `https://github.com/{owner}/{repo}/pull/{number}`).

Run:

```
gh pr view <number> --repo <owner>/<repo> --json headRefName -q .headRefName
```

This returns the branch name for the PR head (e.g. `feature/my-component`).

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

---

## Notes

- This skill does **not** produce an output file. It is a "run and interact" skill.
- The dev server remains running after launch. The user can stop it manually or the agent can kill the process when done.
- If the build fails, inspect the terminal output for errors and report them to the user.
