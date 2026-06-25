// UI logic for the DS Publish Prep Export plugin. Plain DOM, no framework.

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

function byId<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function post(message: unknown): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

function selectedMode(): "current" | "baseline" {
  const checked = document.querySelector(
    'input[name="mode"]:checked'
  ) as HTMLInputElement | null;
  return checked && checked.value === "baseline" ? "baseline" : "current";
}

function setStatus(text: string, isError: boolean): void {
  const el = byId<HTMLDivElement>("status");
  el.textContent = text;
  el.className = isError ? "error" : "";
}

function setBusy(busy: boolean): void {
  byId<HTMLButtonElement>("export").disabled = busy;
}

// Component layer data makes exports large (often many MB). Keep the full JSON
// in memory and only render it into the textarea when small - selecting and
// copying a huge textarea is what freezes the plugin iframe. Download is the
// robust path for large payloads.
let lastJson = "";
let lastMode: "current" | "baseline" = "current";
let pendingMode: "current" | "baseline" = "current";

const TEXTAREA_PREVIEW_LIMIT = 1_000_000; // ~1 MB of characters

function formatBytes(chars: number): string {
  const mb = chars / (1024 * 1024);
  if (mb >= 1) return mb.toFixed(1) + " MB";
  return Math.max(1, Math.round(chars / 1024)) + " KB";
}

function updateModeUI(): void {
  const isBaseline = selectedMode() === "baseline";
  byId<HTMLElement>("baseline-fields").hidden = !isBaseline;
  if (isBaseline) post({ type: "list-libraries" });
}

const modeRadios = document.querySelectorAll('input[name="mode"]');
modeRadios.forEach((radio) => radio.addEventListener("change", updateModeUI));

byId<HTMLButtonElement>("export").addEventListener("click", () => {
  const mode = selectedMode();
  setStatus("Exporting\u2026", false);
  setBusy(true);

  pendingMode = mode;

  if (mode === "current") {
    post({ type: "export", mode: "current" });
    return;
  }

  const libraryName = byId<HTMLSelectElement>("library").value;
  const fileKey = byId<HTMLInputElement>("fileKey").value.trim();
  const token = byId<HTMLInputElement>("token").value.trim();
  if (!fileKey || !token) {
    setBusy(false);
    setStatus("A library file key/URL and a Figma token are required for baseline export.", true);
    return;
  }
  post({ type: "export", mode: "baseline", libraryName, fileKey, token });
});

byId<HTMLButtonElement>("download").addEventListener("click", () => {
  if (!lastJson) return;
  const filename = `library-${lastMode}.json`;
  const blob = new Blob([lastJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus(`Downloaded ${filename}. Save it as inputs/${filename}.`, false);
});

byId<HTMLButtonElement>("copy").addEventListener("click", async () => {
  if (!lastJson) return;
  // Clipboard API copies from the JS string directly (no DOM selection), so it
  // does not freeze on large payloads the way textarea select + execCommand can.
  try {
    await navigator.clipboard.writeText(lastJson);
    setStatus("Copied to clipboard.", false);
    return;
  } catch (e) {
    // Figma's iframe may block the async clipboard API; fall back to execCommand
    // only when the payload is small enough that selection won't freeze.
  }
  const ta = byId<HTMLTextAreaElement>("output");
  if (lastJson.length > TEXTAREA_PREVIEW_LIMIT || ta.value !== lastJson) {
    setStatus(
      `Output is ${formatBytes(lastJson.length)} - too large to copy reliably. Use Download JSON instead.`,
      true
    );
    return;
  }
  ta.select();
  document.execCommand("copy");
  setStatus("Copied to clipboard.", false);
});

window.onmessage = (event: MessageEvent) => {
  const msg = (event.data && event.data.pluginMessage) as PluginMessage | undefined;
  if (!msg) return;

  if (msg.type === "libraries") {
    const select = byId<HTMLSelectElement>("library");
    select.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All enabled libraries";
    select.appendChild(allOption);
    for (const lib of msg.data) {
      const option = document.createElement("option");
      option.value = lib.libraryName;
      option.textContent = lib.libraryName;
      select.appendChild(option);
    }
    return;
  }

  if (msg.type === "result") {
    const json = JSON.stringify(msg.data, null, 2);
    lastJson = json;
    lastMode = pendingMode;

    const ta = byId<HTMLTextAreaElement>("output");
    if (json.length > TEXTAREA_PREVIEW_LIMIT) {
      // Avoid rendering many MB into the textarea (sluggish DOM + freezes on
      // select). Show a short notice; the full JSON is held in memory.
      ta.value =
        `Output is ${formatBytes(json.length)} (${json.length.toLocaleString()} chars).\n` +
        `Too large to preview here - use "Download JSON" to save it, then place it at inputs/library-${lastMode}.json.`;
    } else {
      ta.value = json;
    }

    byId<HTMLButtonElement>("download").disabled = false;
    byId<HTMLButtonElement>("copy").disabled = false;
    setBusy(false);
    const varCount = msg.data.variables.length;
    const styleCount = msg.data.styles.length;
    const componentCount = (msg.data.components || []).length;
    let text = `Exported ${varCount} variable(s), ${styleCount} style(s), and ${componentCount} component(s) - ${formatBytes(json.length)}.`;
    if (msg.warnings && msg.warnings.length) {
      text += ` ${msg.warnings.length} warning(s): ${msg.warnings.slice(0, 3).join("; ")}`;
      if (msg.warnings.length > 3) text += " \u2026";
    }
    setStatus(text, false);
    return;
  }

  if (msg.type === "error") {
    setBusy(false);
    setStatus(`Error: ${msg.message}`, true);
    return;
  }
};

updateModeUI();
