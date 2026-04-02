You are helping a new user set up the DS Toolbox for this project. Work through each step below in order. Use your shell tool to run all checks and commands yourself — do not ask the user to copy and paste commands. Before running any command that installs or modifies something, briefly explain what you're about to do and ask for permission. Read-only checks (e.g. `which`, `--version`, `auth status`) can be run without asking.

---

## Step 1 — Homebrew

Run `which brew` to check if Homebrew is installed.

**If already installed:** Confirm to the user and move on.

**If not installed:**
- Explain that Homebrew is a macOS package manager required to install other tools.
- Ask for permission, then run:
  ```
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
- After install, run `which brew` again to verify it's on the PATH.
- If they're on Apple Silicon (M1/M2/M3) and `brew` is still not found, explain that the shell profile needs updating and ask for permission to append the following to `~/.zprofile`:
  ```
  eval "$(/opt/homebrew/bin/brew shellenv)"
  ```

---

## Step 2 — GitHub CLI

Run `which gh` to check if the GitHub CLI is installed.

**If already installed:** Run `gh auth status` to check authentication.
- If authenticated: Confirm to the user and move on.
- If not authenticated: Skip to the authentication step below.

**If not installed:**
- Explain that the GitHub CLI is used by the toolbox skills to create PRs and interact with repositories.
- Ask for permission, then run:
  ```
  brew install gh
  ```
- Confirm installation by running `gh --version`.

**Authenticate GitHub CLI:**
- `gh auth login` is an interactive command that cannot be run by the shell tool. Explain this to the user, then ask them to open a terminal and run it themselves:
  ```
  gh auth login
  ```
- Guide them through the prompts:
  1. Select **GitHub.com**
  2. Select **HTTPS** as the preferred protocol
  3. Select **Login with a web browser**, copy the one-time code, and complete the browser flow
- Once they confirm it's done, run `gh auth status` yourself to verify it succeeded.

---

## Step 3 — Figma MCP (Project Level)

Run `claude mcp list` to check whether a Figma MCP server is already registered for this project.

**If already registered:**
- Run `claude mcp list` and check for a `figma` entry with status `connected`. If it's listed and connected, confirm and move on.
- If it's listed but not yet authenticated, skip to the **Authenticate** step below.

**If not registered:**
- Explain that this will add the Figma MCP server using HTTP transport.
- Ask for permission, then run:
  ```
  claude mcp add --transport http figma https://mcp.figma.com/mcp
  ```
- Confirm it was added by running `claude mcp list` again and checking for the `figma` entry.

**Restart required:**
- Explain to the user that Claude must be fully restarted before the new MCP server is loaded — it won't be active in the current session.
- Ask them to quit and reopen Claude, then re-run `/ds-toolbox-setup` to continue.
- Once they confirm they've restarted and are back, proceed to the step below.

**Authenticate:**
- After restart, the Figma MCP will be registered but needs a one-time browser sign-in.
- Explain that `/mcp` is a Claude slash command (not a shell command), so the user needs to run it themselves.
- Ask them to type `/mcp` in the chat input, find the `figma` entry, and click **Authenticate** to open the browser authentication flow and complete the Figma sign-in.
- Once they confirm authentication is done, run `claude mcp list` to verify the `figma` entry shows as connected.

---

## Completion

Once all three steps are confirmed:
- Let the user know the environment is fully set up.
- Tell them they can now run the `ds-toolbox` command with a review type (e.g. `/ds-toolbox token review`) to start using the toolbox.
