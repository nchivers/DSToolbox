You are helping a user set up the Affirm UX mobile development environment. This command should be run after the `ds-toolbox-setup` command has completed. Work through each step below in order. Use your shell tool to run all checks and commands yourself — do not ask the user to copy and paste commands. Before running any command that installs or modifies something, briefly explain what you're about to do and ask for permission. Read-only checks (e.g. `which`, `--version`, `ls`) can be run without asking.

The UX repo will be cloned into the same parent directory as the DSToolbox repo (i.e. `../` relative to this workspace).

---

## Step 1 — Clone the UX repo

Check whether `../ux` already exists (relative to this workspace root).

**If the directory exists:**
- Run `git -C ../ux remote get-url origin` to confirm it points to `https://github.com/Affirm/ux.git`.
- If it does, confirm to the user and move on.
- If the remote doesn't match, warn the user and ask how they'd like to proceed.

**If the directory does not exist:**
- Explain that you will clone the Affirm UX monorepo into the Projects folder.
- Ask for permission, then run:
  ```
  gh repo clone Affirm/ux ../ux
  ```
- Confirm the clone succeeded by checking that `../ux/.git` exists.

For all remaining steps, run commands with the working directory set to the ux repo (`../ux`).

---

## Step 2 — Homebrew tools (asdf & watchman)

The UX repo uses **asdf** for version management and **watchman** for React Native file watching.

Run `which asdf` and `which watchman` to check if both are installed.

**For each tool that is missing:**
- Explain what the tool is used for.
- Ask for permission, then run:
  ```
  brew install asdf watchman
  ```
- Confirm installation with `asdf --version` and `watchman --version`.

---

## Step 3 — Configure asdf

Check whether `~/.zshrc` already contains the asdf shims PATH entry.

**If not present:**
- Explain that asdf needs to be on the PATH so that the correct tool versions are resolved.
- Ask for permission, then append the following to `~/.zshrc`:
  ```
  export PATH="${ASDF_DATA_DIR:-$HOME/.asdf}/shims:$PATH"
  ```
- Source the file: `source ~/.zshrc`

---

## Step 4 — asdf plugins

The UX repo requires **nodejs**, **ruby**, and **java** asdf plugins. Check which plugins are already installed by running `asdf plugin list`.

**For each missing plugin, ask for permission then add it:**
```
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf plugin add ruby https://github.com/asdf-vm/asdf-ruby.git
asdf plugin add java https://github.com/halcyon/asdf-java.git
```

---

## Step 5 — Configure asdf plugins

Check whether `~/.zshrc` already contains each of the following entries. For any that are missing, explain what they do, ask for permission, then append them:

1. **JAVA_HOME** — required for Android/Gradle builds:
   ```
   . ~/.asdf/plugins/java/set-java-home.zsh
   ```
2. **Corepack auto-enable** — ensures the correct pnpm version is used automatically:
   ```
   export ASDF_NODEJS_AUTO_ENABLE_COREPACK=1
   ```

After appending, run `source ~/.zshrc`.

---

## Step 6 — Ruby build dependencies

Ruby (managed by asdf) requires native build dependencies. Check whether the following are installed via `brew list --formula`:

- `openssl@3`
- `readline`
- `libyaml`
- `gmp`
- `autoconf`

**For any that are missing:**
- Explain these are build dependencies required to compile Ruby.
- Ask for permission, then install them all in one command:
  ```
  brew install openssl@3 readline libyaml gmp autoconf
  ```

Also check for `rbenv/tap/openssl@1.1`:
```
brew list openssl@1.1 2>/dev/null
```
If not installed, ask for permission and run:
```
brew tap rbenv/tap && brew install rbenv/tap/openssl@1.1
```

---

## Step 7 — asdf install

This will install the Node, Ruby, and Java versions specified in the UX repo's `.tool-versions` file.

- Explain that this step may take several minutes as it compiles/downloads language runtimes.
- Ask for permission, then run (from the ux repo directory):
  ```
  asdf install
  ```
- After completion, verify:
  1. `which node` points to a path containing `.asdf/shims/node`
  2. `node --version` matches the version in `.tool-versions`
  3. `ruby --version` is working
  4. `java --version` is working

---

## Step 8 — Turbo

Run `which turbo` to check if Turbo is installed.

**If not installed:**
- Explain that Turbo is the monorepo task runner used by the UX project.
- Ask for permission, then run (from the ux repo directory):
  ```
  npm i -g turbo
  ```
- Confirm with `turbo --version`.

---

## Step 9 — Xcode

Run `which xcodes` to check if the Xcode version manager is installed.

**If not installed:**
- Explain that `xcodes` manages Xcode versions and the UX project requires Xcode 16.4.
- Ask for permission, then run:
  ```
  brew install xcodes
  ```

Check installed Xcode versions with `xcodes installed`.

**If Xcode 16.4 is not installed:**
- Explain that this is a large download (several GB) and will take a while.
- Ask for permission, then run:
  ```
  xcodes install "xcode 16.4"
  ```

After Xcode is installed, verify the Command Line Tools are configured:
```
xcode-select -p
```
If it doesn't point to the Xcode 16.4 app, explain and ask for permission to set it:
```
sudo xcode-select -s /Applications/Xcode-16.4.0.app/Contents/Developer
```

---

## Step 10 — Android Studio & SDK

Android Studio must be installed manually. Check whether it's already installed:
```
ls /Applications/Android\ Studio.app 2>/dev/null
```

**If not installed:**
- Tell the user to download Android Studio from https://developer.android.com/studio, selecting the correct architecture for their Mac (Apple Silicon or Intel).
- Walk them through the install wizard: use the default SDK and AVD options.
- Wait for them to confirm the install is complete before proceeding.

**Configure Android environment variables:**
Check whether `~/.zshrc` already contains `ANDROID_HOME`. If not:
- Explain these PATH entries are needed for Android builds.
- Ask for permission, then append the following to `~/.zshrc`:
  ```
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
- Run `source ~/.zshrc` and verify with `echo $ANDROID_HOME`.

**Android SDK configuration:**
- Tell the user to open Android Studio, go to `More Actions -> SDK Manager`.
- Under **Android 15 (VanillaIceCream)**, enable `Show Package Details` and select:
  - Android SDK Platform 35
  - Google APIs ARM 64 v8a System Image (for Apple Silicon) or the appropriate Intel image
- Under **SDK Tools**, select Android SDK Build Tools v35.0.0.
- Click OK to install and confirm when done.

**Android Emulator:**
- Tell the user to go to `More Actions -> Virtual Device Manager` in Android Studio and create an emulator with their desired settings.
- Wait for them to confirm before proceeding.

---

## Step 11 — Environment variables

Check whether `apps/mobile/.env` exists in the ux repo.

**If not present:**
- Explain this copies the example environment config for local development.
- Ask for permission, then run (from the ux repo directory):
  ```
  cp apps/mobile/.env.example apps/mobile/.env
  ```
- Tell the user to review the file and update any placeholder values. Note that `EXPO_PUBLIC_APP_VARIANT` is a required variable — refer them to `apps/mobile/app.config.ts` for the available variants.

**If already present:**
- Confirm and move on.

---

## Step 12 — iOS Code Signing

This is a manual step that only needs to be done once per machine.

- Explain that the UX project requires Apple code signing certificates, even for simulator builds, because it uses Associated Domains entitlements for Universal Links.
- Tell the user they need an Apple ID associated with their Affirm account. If they don't have one, they should request access in the `#ask-ios` Slack channel using their `gh-mail` email alias (e.g. `firstname.lastname@gh-mail.affirm.com`).
- Direct them to follow the Expo code signing setup guide: https://github.com/expo/fyi/blob/main/setup-xcode-signing.md
- Wait for them to confirm this is done (or that they've already set it up).

---

## Step 13 — Install dependencies & build

Now run the initial install and build steps from the ux repo directory.

**Install pnpm dependencies:**
- Explain this installs all monorepo dependencies.
- Ask for permission, then run:
  ```
  pnpm install
  ```

**Run Expo prebuild:**
- Explain this generates the native iOS and Android project files.
- Ask for permission, then run:
  ```
  pnpm --filter mobile prebuild:clean
  ```

**Build and run on iOS:**
- Ask if the user wants to test the iOS build. If yes:
  ```
  pnpm --filter mobile ios
  ```

**Build and run on Android:**
- Ask if the user wants to test the Android build. If yes:
  ```
  pnpm --filter mobile android
  ```

---

## Completion

Once all steps are confirmed:
- Let the user know the UX mobile development environment is fully set up.
- Tell them they can start the dev server quickly in the future with:
  ```
  pnpm --filter mobile dev
  ```
- Remind them that the UX repo is located at `../ux` relative to the DSToolbox workspace.
