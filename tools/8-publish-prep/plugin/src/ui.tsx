import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ThemeProvider, Type } from "./design-system";
import {
  Button,
  Dropdown,
  InputText,
  InputTextArea,
  PageFooter,
  PageHeader,
  Radio,
  SectionHeader,
} from "./design-system/components";
import type { DropdownOption } from "./design-system/components";
import type { TypeColor } from "./design-system/components";
import "./ui.scss";

type Mode = "current" | "baseline";

interface LibrariesMessage {
  type: "libraries";
  data: Array<{ libraryName: string }>;
}

interface ResultMessage {
  type: "result";
  data: { variables: unknown[]; styles: unknown[]; components: unknown[] };
  warnings?: string[];
}

interface ErrorMessage {
  type: "error";
  message: string;
}

type PluginMessage = LibrariesMessage | ResultMessage | ErrorMessage;

// Component layer data makes exports large (often many MB). Keep the full JSON
// in memory and only render it into the textarea when small - selecting and
// copying a huge textarea is what freezes the plugin iframe. Download is the
// robust path for large payloads.
const TEXTAREA_PREVIEW_LIMIT = 1_000_000; // ~1 MB of characters

type StatusTone = "info" | "error" | "success";

function formatBytes(chars: number): string {
  const mb = chars / (1024 * 1024);
  if (mb >= 1) return mb.toFixed(1) + " MB";
  return Math.max(1, Math.round(chars / 1024)) + " KB";
}

function post(message: unknown): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

const STATUS_COLOR: Record<StatusTone, TypeColor> = {
  info: "text.secondary",
  error: "text.critical",
  success: "text.success",
};

function App() {
  const [mode, setMode] = React.useState<Mode>("current");
  const [libraryOptions, setLibraryOptions] = React.useState<DropdownOption[]>([
    { value: "", label: "All enabled libraries" },
  ]);
  const [library, setLibrary] = React.useState("");
  const [fileKey, setFileKey] = React.useState("");
  const [token, setToken] = React.useState("");
  const [fileKeyError, setFileKeyError] = React.useState("");
  const [tokenError, setTokenError] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [output, setOutput] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [statusTone, setStatusTone] = React.useState<StatusTone>("info");
  const [canExportFile, setCanExportFile] = React.useState(false);

  // Full JSON is held outside React state so a multi-MB payload is never forced
  // through the textarea render path.
  const lastJson = React.useRef("");
  const lastMode = React.useRef<Mode>("current");
  const pendingMode = React.useRef<Mode>("current");

  const showStatus = React.useCallback((text: string, tone: StatusTone) => {
    setStatus(text);
    setStatusTone(tone);
  }, []);

  React.useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = (event.data && event.data.pluginMessage) as PluginMessage | undefined;
      if (!msg) return;

      if (msg.type === "libraries") {
        const options: DropdownOption[] = [
          { value: "", label: "All enabled libraries" },
        ];
        for (const lib of msg.data) {
          options.push({ value: lib.libraryName, label: lib.libraryName });
        }
        setLibraryOptions(options);
        return;
      }

      if (msg.type === "result") {
        const json = JSON.stringify(msg.data, null, 2);
        lastJson.current = json;
        lastMode.current = pendingMode.current;

        if (json.length > TEXTAREA_PREVIEW_LIMIT) {
          setOutput(
            `Output is ${formatBytes(json.length)} (${json.length.toLocaleString()} chars).\n` +
              `Too large to preview here - use "Download JSON" to save it, then place it at inputs/library-${lastMode.current}.json.`
          );
        } else {
          setOutput(json);
        }

        setCanExportFile(true);
        setBusy(false);

        const varCount = msg.data.variables.length;
        const styleCount = msg.data.styles.length;
        const componentCount = (msg.data.components || []).length;
        let text = `Exported ${varCount} variable(s), ${styleCount} style(s), and ${componentCount} component(s) - ${formatBytes(json.length)}.`;
        if (msg.warnings && msg.warnings.length) {
          text += ` ${msg.warnings.length} warning(s): ${msg.warnings.slice(0, 3).join("; ")}`;
          if (msg.warnings.length > 3) text += " \u2026";
        }
        showStatus(text, "success");
        return;
      }

      if (msg.type === "error") {
        setBusy(false);
        showStatus(`Error: ${msg.message}`, "error");
        return;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [showStatus]);

  const handleModeChange = (next: Mode) => {
    setMode(next);
    setFileKeyError("");
    setTokenError("");
    if (next === "baseline") {
      post({ type: "list-libraries" });
    }
  };

  const handleExport = () => {
    if (mode === "current") {
      pendingMode.current = "current";
      showStatus("Exporting\u2026", "info");
      setBusy(true);
      post({ type: "export", mode: "current" });
      return;
    }

    // Baseline: validate in the UI and surface inline errors (never disable the
    // button for incomplete input).
    let hasError = false;
    if (!fileKey.trim()) {
      setFileKeyError("A library main file key or URL is required.");
      hasError = true;
    }
    if (!token.trim()) {
      setTokenError("A Figma personal access token is required.");
      hasError = true;
    }
    if (hasError) {
      showStatus("Fix the highlighted fields to export a baseline.", "error");
      return;
    }

    pendingMode.current = "baseline";
    showStatus("Exporting\u2026", "info");
    setBusy(true);
    post({
      type: "export",
      mode: "baseline",
      libraryName: library,
      fileKey: fileKey.trim(),
      token: token.trim(),
    });
  };

  const handleDownload = () => {
    if (!lastJson.current) return;
    const filename = `library-${lastMode.current}.json`;
    const blob = new Blob([lastJson.current], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showStatus(`Downloaded ${filename}. Save it as inputs/${filename}.`, "info");
  };

  const handleCopy = async () => {
    if (!lastJson.current) return;
    // Clipboard API copies from the JS string directly (no DOM selection), so it
    // does not freeze on large payloads the way textarea select can.
    try {
      await navigator.clipboard.writeText(lastJson.current);
      showStatus("Copied to clipboard.", "success");
      return;
    } catch (e) {
      // Figma's iframe may block the async clipboard API.
    }
    if (lastJson.current.length > TEXTAREA_PREVIEW_LIMIT) {
      showStatus(
        `Output is ${formatBytes(lastJson.current.length)} - too large to copy reliably. Use Download JSON instead.`,
        "error"
      );
      return;
    }
    showStatus("Could not access the clipboard. Use Download JSON instead.", "error");
  };

  return (
    <main>
      <header>
        <PageHeader
          title="DS Publish Prep Export"
          description="This plugin exports a library's variables, styles, and components to JSON for the DS Toolbox Publish Prep tool."
        />
      </header>

      <section className="affirm-publish-prep">
        <div className="affirm-publish-prep__header-inputs">
          <SectionHeader
              title="Mode"
              body="Use Export Current in the library file or branch. Use Export Baseline in a Baselining File that subscribes to the published library. Most outputs will be very large, so use Download JSON to save it."
            />
          <div className="affirm-publish-prep__modes" role="radiogroup" aria-label="Export mode">
            <Radio
              label="Export Current (open in the library / branch)"
              name="mode"
              value="current"
              checked={mode === "current"}
              onChange={() => handleModeChange("current")}
            />
            <Radio
              label="Export Baseline (open in the Baseline file)"
              name="mode"
              value="baseline"
              checked={mode === "baseline"}
              onChange={() => handleModeChange("baseline")}
            />
          </div>

          {mode === "baseline" && (
            <div className="affirm-publish-prep__fields">
              <Dropdown
                label="Library"
                value={library}
                options={libraryOptions}
                onChange={setLibrary}
              />
              <InputText
                label="Library main file key or URL"
                value={fileKey}
                error={!!fileKeyError}
                errorMessage={fileKeyError}
                onChange={(e) => {
                  setFileKey(e.target.value);
                  setFileKeyError("");
                }}
              />
              <InputText
                label="Figma personal access token"
                type="password"
                value={token}
                error={!!tokenError}
                errorMessage={tokenError}
                message="Needs library_content:read + files:read"
                onChange={(e) => {
                  setToken(e.target.value);
                  setTokenError("");
                }}
              />
            </div>
          )}
        </div>

        <div className="affirm-publish-prep__actions">
          <Button label="Export" loading={busy} onClick={handleExport} />
          <Button
            label="Download JSON"
            emphasis="secondary"
            variant="neutral"
            disabled={!canExportFile}
            onClick={handleDownload}
          />
          <Button
            label="Copy JSON"
            emphasis="secondary"
            variant="neutral"
            disabled={!canExportFile}
            onClick={handleCopy}
          />
        </div>

        <InputTextArea
          label="Output JSON"
          className="affirm-publish-prep__output"
          value={output}
          readOnly
          rows={10}
        />

        {status && (
          <Type variant="body.small" color={STATUS_COLOR[statusTone]}>
            {status}
          </Type>
        )}
      </section>

      <PageFooter
        builderName="Nick Chivers"
        updatedDate="06.25.2026"
        className="affirm-page-footer"
      />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-page")).render(
  <ThemeProvider defaultTheme="affirm" defaultMode="auto">
    <App />
  </ThemeProvider>
);
