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

byId<HTMLButtonElement>("copy").addEventListener("click", () => {
  const ta = byId<HTMLTextAreaElement>("output");
  if (!ta.value) return;
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
    byId<HTMLTextAreaElement>("output").value = json;
    byId<HTMLButtonElement>("copy").disabled = false;
    setBusy(false);
    const varCount = msg.data.variables.length;
    const styleCount = msg.data.styles.length;
    const componentCount = (msg.data.components || []).length;
    let text = `Exported ${varCount} variable(s), ${styleCount} style(s), and ${componentCount} component(s).`;
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
