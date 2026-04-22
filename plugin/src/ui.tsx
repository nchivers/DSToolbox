import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ThemeProvider, Type } from "./design-system";
import {
  Button,
  InputTextArea,
  PageHeader,
  PageFooter,
} from "./design-system/components";
import "./ui.scss";

interface ExportResultMessage {
  type: "export-result";
  data: unknown[];
}

interface ExportErrorMessage {
  type: "export-error";
  message: string;
}

type PluginMessage = ExportResultMessage | ExportErrorMessage;

function App() {
  const [jsonOutput, setJsonOutput] = React.useState("");
  const [exporting, setExporting] = React.useState(false);
  const [statusText, setStatusText] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const pendingDone = React.useRef(false);

  React.useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as PluginMessage | undefined;
      if (!msg) return;

      if (msg.type === "export-result") {
        const json = JSON.stringify(msg.data, null, 2);
        pendingDone.current = true;
        setJsonOutput(json);
        setStatusText(`Exported ${msg.data.length} variable(s).`);
        setIsError(false);
      } else if (msg.type === "export-error") {
        pendingDone.current = true;
        setJsonOutput("");
        setStatusText(`Error: ${msg.message}`);
        setIsError(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Clear loading after React commits the new jsonOutput to the DOM and
  // the browser finishes painting it (double-rAF ensures paint is done).
  React.useLayoutEffect(() => {
    if (!pendingDone.current) return;
    pendingDone.current = false;
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setExporting(false);
      });
    });
    return () => { cancelled = true; };
  }, [jsonOutput, statusText]);

  const handleExport = () => {
    setExporting(true);
    setStatusText("Exporting\u2026");
    setIsError(false);
    parent.postMessage(
      { pluginMessage: { type: "export-variables" } },
      "*"
    );
  };

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    const el = textAreaRef.current;
    if (!el) return;
    el.select();
    document.execCommand("copy");
    setStatusText("Copied to clipboard.");
    setIsError(false);
  };

  return (
    <main>
      <PageHeader
        title="Export Variables to JSON"
        description="Exports id, name, collection, resolvedType, valuesByMode, hiddenFromPublishing, and scopes from this file."
      />

      <section className="affirm-actions">
        <Button
          label="Export variables"
          emphasis="primary"
          onClick={handleExport}
          disabled={exporting}
          loading={exporting}
        />
        <Button
          label="Copy JSON"
          emphasis="secondary"
          onClick={handleCopy}
          disabled={!jsonOutput}
        />
      </section>

      <section className="affirm-output">
        <InputTextArea
          ref={textAreaRef}
          label="JSON output"
          value={jsonOutput}
          readOnly
          placeholder='Click "Export variables" to generate JSON\u2026'
        />
      </section>

      {statusText && (
        <section className="affirm-status">
          <Type
            variant="body.small"
            color={isError ? "text.critical" : "text.secondary"}
          >
            {statusText}
          </Type>
        </section>
      )}

      <PageFooter
        builderName="Nick Chivers"
        updatedDate="April 2026"
        className="affirm-page-footer"
      />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-page")!).render(
  <ThemeProvider defaultTheme="affirm" defaultMode="auto">
    <App />
  </ThemeProvider>
);
