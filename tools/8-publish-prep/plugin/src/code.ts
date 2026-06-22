/// <reference types="@figma/plugin-typings" />

// DS Publish Prep Export
//
// Serializes a design system library's publishable surface (variables + styles)
// to JSON. Two modes:
//   - "current":  reads LOCAL variables/styles from the open file (the library or
//                 a branch). Reflects pending, unpublished edits.
//   - "baseline": reads REMOTE variables/styles from a Baselining File that
//                 subscribes to the published library. Reflects the LAST PUBLISHED
//                 state. Variables come from the teamLibrary API; style keys are
//                 listed via the Figma REST API and imported by key.
//
// The two snapshots are diffed by the DS Toolbox `library_diff.py` script.

const SCHEMA_VERSION = 2;

type StyleKind = "PAINT" | "TEXT" | "EFFECT" | "GRID";

type ComponentKind = "COMPONENT" | "COMPONENT_SET";

interface SerializedAlias {
  type: "VARIABLE_ALIAS";
  id: string;
  name?: string;
}

interface SerializedColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

type SerializedValue =
  | SerializedAlias
  | SerializedColor
  | string
  | number
  | boolean
  | null;

interface ModeValue {
  modeName: string;
  value: SerializedValue;
}

interface ExportedVariable {
  id: string;
  key: string;
  name: string;
  collection: string;
  resolvedType: string;
  valuesByMode: Record<string, ModeValue>;
  hiddenFromPublishing: boolean;
  scopes: string[];
}

interface ExportedStyle {
  id: string;
  key: string;
  name: string;
  type: StyleKind;
  description?: string;
  paints?: unknown[];
  text?: unknown;
  effects?: unknown[];
  grids?: unknown[];
}

interface ExportedComponentProperty {
  type: string;
  default: SerializedValue;
  variantOptions?: string[];
  preferredValues?: unknown[];
}

interface ExportedComponent {
  id: string;
  key: string;
  name: string;
  type: ComponentKind;
  description?: string;
  documentationLinks?: string[];
  componentProperties: Record<string, ExportedComponentProperty>;
}

interface Snapshot {
  schemaVersion: number;
  source: "current" | "baseline";
  exportedAt: string;
  libraryName?: string;
  variables: ExportedVariable[];
  styles: ExportedStyle[];
  components: ExportedComponent[];
}

// ----------------------------------------------------------------------------
// Shared helpers
// ----------------------------------------------------------------------------

const varNameCache = new Map<string, string | undefined>();

async function resolveVarName(id: string): Promise<string | undefined> {
  if (varNameCache.has(id)) return varNameCache.get(id);
  try {
    const v = await figma.variables.getVariableByIdAsync(id);
    varNameCache.set(id, v ? v.name : undefined);
    return v ? v.name : undefined;
  } catch (e) {
    varNameCache.set(id, undefined);
    return undefined;
  }
}

function serializeColor(c: RGB | RGBA): SerializedColor {
  const out: SerializedColor = { r: c.r, g: c.g, b: c.b };
  if ("a" in c) out.a = (c as RGBA).a;
  return out;
}

function isAlias(value: unknown): value is VariableAlias {
  return (
    !!value &&
    typeof value === "object" &&
    (value as VariableAlias).type === "VARIABLE_ALIAS"
  );
}

async function serializeAlias(alias: VariableAlias): Promise<SerializedAlias> {
  return { type: "VARIABLE_ALIAS", id: alias.id, name: await resolveVarName(alias.id) };
}

async function serializeBoundVariables(
  bound: unknown
): Promise<Record<string, unknown> | undefined> {
  if (!bound || typeof bound !== "object") return undefined;
  const out: Record<string, unknown> = {};
  for (const [field, val] of Object.entries(bound as Record<string, unknown>)) {
    if (Array.isArray(val)) {
      out[field] = await Promise.all(
        val.filter(isAlias).map((a) => serializeAlias(a as VariableAlias))
      );
    } else if (isAlias(val)) {
      out[field] = await serializeAlias(val);
    }
  }
  return Object.keys(out).length ? out : undefined;
}

async function serializeVariableValue(
  value: VariableValue | null | undefined
): Promise<SerializedValue> {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") {
    if (isAlias(value)) return await serializeAlias(value);
    if ("r" in value && "g" in value && "b" in value) {
      return serializeColor(value as RGBA);
    }
  }
  return value as string | number | boolean;
}

// ----------------------------------------------------------------------------
// Style serialization (shared between current/local and baseline/remote styles)
// ----------------------------------------------------------------------------

async function serializePaint(paint: Paint): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {
    type: paint.type,
    visible: paint.visible !== false,
    opacity: typeof paint.opacity === "number" ? paint.opacity : 1,
  };
  if (paint.type === "SOLID") {
    const solid = paint as SolidPaint;
    out.color = serializeColor(solid.color);
    const bound = await serializeBoundVariables((solid as unknown as { boundVariables?: unknown }).boundVariables);
    if (bound) out.boundVariables = bound;
  } else if (paint.type.indexOf("GRADIENT") === 0) {
    const grad = paint as GradientPaint;
    out.gradientStops = await Promise.all(
      grad.gradientStops.map(async (stop) => {
        const stopOut: Record<string, unknown> = {
          position: stop.position,
          color: serializeColor(stop.color),
        };
        const bound = await serializeBoundVariables(
          (stop as unknown as { boundVariables?: unknown }).boundVariables
        );
        if (bound) stopOut.boundVariables = bound;
        return stopOut;
      })
    );
    out.gradientTransform = grad.gradientTransform;
  } else if (paint.type === "IMAGE") {
    const img = paint as ImagePaint;
    out.imageHash = img.imageHash;
    out.scaleMode = img.scaleMode;
  }
  return out;
}

async function serializeTextStyle(style: TextStyle): Promise<Record<string, unknown>> {
  return {
    fontName: style.fontName,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textCase: style.textCase,
    textDecoration: style.textDecoration,
    paragraphIndent: style.paragraphIndent,
    paragraphSpacing: style.paragraphSpacing,
    boundVariables: await serializeBoundVariables(style.boundVariables),
  };
}

async function serializeEffect(effect: Effect): Promise<Record<string, unknown>> {
  const anyEffect = effect as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {
    type: effect.type,
    visible: (anyEffect.visible as boolean) !== false,
  };
  if (typeof anyEffect.radius === "number") out.radius = anyEffect.radius;

  if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
    const shadow = effect as DropShadowEffect | InnerShadowEffect;
    out.color = serializeColor(shadow.color);
    out.offset = { x: shadow.offset.x, y: shadow.offset.y };
    out.spread = shadow.spread;
    out.blendMode = shadow.blendMode;
  }
  const bound = await serializeBoundVariables(anyEffect.boundVariables);
  if (bound) out.boundVariables = bound;
  return out;
}

function serializeGrid(grid: LayoutGrid): Record<string, unknown> {
  const out: Record<string, unknown> = {
    pattern: grid.pattern,
    visible: grid.visible !== false,
  };
  if (grid.pattern === "GRID") {
    out.sectionSize = (grid as { sectionSize: number }).sectionSize;
  } else {
    const rc = grid as RowsColsLayoutGrid;
    out.alignment = rc.alignment;
    out.gutterSize = rc.gutterSize;
    out.count = rc.count;
    if (typeof rc.sectionSize === "number") out.sectionSize = rc.sectionSize;
    if (typeof rc.offset === "number") out.offset = rc.offset;
  }
  return out;
}

async function serializeStyle(style: BaseStyle): Promise<ExportedStyle> {
  const out: ExportedStyle = {
    id: style.id,
    key: style.key,
    name: style.name,
    type: style.type as StyleKind,
  };
  if (style.description) out.description = style.description;

  switch (style.type) {
    case "PAINT":
      out.paints = await Promise.all((style as PaintStyle).paints.map(serializePaint));
      break;
    case "TEXT":
      out.text = await serializeTextStyle(style as TextStyle);
      break;
    case "EFFECT":
      out.effects = await Promise.all((style as EffectStyle).effects.map(serializeEffect));
      break;
    case "GRID":
      out.grids = (style as GridStyle).layoutGrids.map(serializeGrid);
      break;
  }
  return out;
}

// ----------------------------------------------------------------------------
// Component serialization (shared between current/local and baseline/remote)
// ----------------------------------------------------------------------------

// Figma appends a unique suffix (e.g. "Disabled#12:3") to non-variant property
// names. The suffix is node-id based and differs between a local file and a
// subscribed library, so it is stripped to keep the diff stable.
function cleanPropertyName(name: string): string {
  const hash = name.indexOf("#");
  return hash === -1 ? name : name.slice(0, hash);
}

function serializeComponentProperties(
  defs: ComponentPropertyDefinitions
): Record<string, ExportedComponentProperty> {
  const out: Record<string, ExportedComponentProperty> = {};
  for (const [rawName, def] of Object.entries(defs)) {
    const prop: ExportedComponentProperty = {
      type: def.type,
      default: def.defaultValue as SerializedValue,
    };
    if (def.variantOptions) prop.variantOptions = [...def.variantOptions];
    if (def.preferredValues) prop.preferredValues = def.preferredValues as unknown[];
    out[cleanPropertyName(rawName)] = prop;
  }
  return out;
}

function serializeComponent(
  node: ComponentNode | ComponentSetNode
): ExportedComponent {
  const out: ExportedComponent = {
    id: node.id,
    key: node.key,
    name: node.name,
    type: node.type as ComponentKind,
    componentProperties: serializeComponentProperties(node.componentPropertyDefinitions),
  };
  if (node.description) out.description = node.description;
  if (node.documentationLinks && node.documentationLinks.length) {
    out.documentationLinks = node.documentationLinks.map((l) => l.uri);
  }
  return out;
}

// ----------------------------------------------------------------------------
// Current (local) export
// ----------------------------------------------------------------------------

async function exportCurrent(): Promise<Snapshot> {
  const [variables, collections] = await Promise.all([
    figma.variables.getLocalVariablesAsync(),
    figma.variables.getLocalVariableCollectionsAsync(),
  ]);

  const collectionIdToName = new Map<string, string>();
  const modeIdToName = new Map<string, string>();
  for (const coll of collections) {
    collectionIdToName.set(coll.id, coll.name);
    for (const mode of coll.modes) modeIdToName.set(mode.modeId, mode.name);
  }

  const exportedVariables: ExportedVariable[] = [];
  for (const v of variables) {
    const valuesByMode: Record<string, ModeValue> = {};
    for (const [modeId, value] of Object.entries(v.valuesByMode)) {
      valuesByMode[modeId] = {
        modeName: modeIdToName.get(modeId) || modeId,
        value: await serializeVariableValue(value),
      };
    }
    exportedVariables.push({
      id: v.id,
      key: v.key,
      name: v.name,
      collection: collectionIdToName.get(v.variableCollectionId) || v.variableCollectionId,
      resolvedType: v.resolvedType,
      valuesByMode,
      hiddenFromPublishing: v.hiddenFromPublishing,
      scopes: v.scopes ? [...v.scopes] : [],
    });
  }

  const [paintStyles, textStyles, effectStyles, gridStyles] = await Promise.all([
    figma.getLocalPaintStylesAsync(),
    figma.getLocalTextStylesAsync(),
    figma.getLocalEffectStylesAsync(),
    figma.getLocalGridStylesAsync(),
  ]);

  const allStyles: BaseStyle[] = [
    ...paintStyles,
    ...textStyles,
    ...effectStyles,
    ...gridStyles,
  ];
  const styles = await Promise.all(allStyles.map(serializeStyle));

  // Components: load every page (required under documentAccess: "dynamic-page")
  // then collect components and component sets. Variant components inside a set
  // are dropped so each set is reported once at the set level.
  await figma.loadAllPagesAsync();
  const componentNodes = figma.root.findAllWithCriteria({
    types: ["COMPONENT", "COMPONENT_SET"],
  }) as Array<ComponentNode | ComponentSetNode>;
  const components: ExportedComponent[] = [];
  for (const node of componentNodes) {
    if (node.type === "COMPONENT" && node.parent && node.parent.type === "COMPONENT_SET") {
      continue;
    }
    components.push(serializeComponent(node));
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    source: "current",
    exportedAt: new Date().toISOString(),
    variables: exportedVariables,
    styles,
    components,
  };
}

// ----------------------------------------------------------------------------
// Baseline (remote / published) export
// ----------------------------------------------------------------------------

function parseFileKey(input: string): string {
  const s = (input || "").trim();
  const m = s.match(/\/(?:design|file)\/([A-Za-z0-9]+)/);
  return m ? m[1] : s;
}

async function fetchPublishedStyleKeys(
  fileKeyOrUrl: string,
  token: string
): Promise<string[]> {
  const fileKey = parseFileKey(fileKeyOrUrl);
  if (!fileKey) throw new Error("A library main file key or URL is required.");
  if (!token) throw new Error("A Figma personal access token is required.");

  const res = await fetch(
    `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/styles`,
    { headers: { "X-Figma-Token": token } }
  );
  if (!res.ok) {
    throw new Error(
      `Figma REST styles request failed: ${res.status} ${res.statusText}. ` +
        `Confirm the file key is the MAIN library file (not a branch) and the token has library_content:read + files:read.`
    );
  }
  const json = (await res.json()) as { meta?: { styles?: Array<{ key?: string }> } };
  const styles = (json.meta && json.meta.styles) || [];
  const keys: string[] = [];
  for (const s of styles) if (s && s.key) keys.push(s.key);
  return keys;
}

interface PublishedComponent {
  key?: string;
  component_set_id?: string;
  containing_frame?: { containingStateGroup?: { nodeId?: string } };
}

async function fetchJson<T>(url: string, token: string, label: string): Promise<T> {
  const res = await fetch(url, { headers: { "X-Figma-Token": token } });
  if (!res.ok) {
    throw new Error(
      `Figma REST ${label} request failed: ${res.status} ${res.statusText}. ` +
        `Confirm the file key is the MAIN library file (not a branch) and the token has library_content:read + files:read.`
    );
  }
  return (await res.json()) as T;
}

async function fetchPublishedComponentKeys(
  fileKeyOrUrl: string,
  token: string
): Promise<{ componentKeys: string[]; componentSetKeys: string[] }> {
  const fileKey = parseFileKey(fileKeyOrUrl);
  if (!fileKey) throw new Error("A library main file key or URL is required.");
  if (!token) throw new Error("A Figma personal access token is required.");

  const setsJson = await fetchJson<{ meta?: { component_sets?: Array<{ key?: string }> } }>(
    `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/component_sets`,
    token,
    "component_sets"
  );
  const componentSetKeys: string[] = [];
  for (const s of (setsJson.meta && setsJson.meta.component_sets) || []) {
    if (s && s.key) componentSetKeys.push(s.key);
  }

  const compsJson = await fetchJson<{ meta?: { components?: PublishedComponent[] } }>(
    `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/components`,
    token,
    "components"
  );
  // Skip components that are variants inside a set; the set is imported instead.
  const componentKeys: string[] = [];
  for (const c of (compsJson.meta && compsJson.meta.components) || []) {
    if (!c || !c.key) continue;
    const inSet =
      !!c.component_set_id ||
      !!(c.containing_frame && c.containing_frame.containingStateGroup);
    if (inSet) continue;
    componentKeys.push(c.key);
  }

  return { componentKeys, componentSetKeys };
}

async function exportBaseline(
  libraryName: string,
  fileKeyOrUrl: string,
  token: string
): Promise<{ snapshot: Snapshot; warnings: string[] }> {
  const warnings: string[] = [];

  // --- Variables via teamLibrary ---
  const libCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const targetCollections = libraryName
    ? libCollections.filter((c) => c.libraryName === libraryName)
    : libCollections;

  if (libraryName && targetCollections.length === 0) {
    warnings.push(
      `No enabled library variable collections found for library "${libraryName}".`
    );
  }

  const collectionCache = new Map<string, VariableCollection | null>();
  async function getCollection(id: string): Promise<VariableCollection | null> {
    if (collectionCache.has(id)) return collectionCache.get(id) as VariableCollection | null;
    let coll: VariableCollection | null = null;
    try {
      coll = await figma.variables.getVariableCollectionByIdAsync(id);
    } catch (e) {
      coll = null;
    }
    collectionCache.set(id, coll);
    return coll;
  }

  const exportedVariables: ExportedVariable[] = [];
  for (const libColl of targetCollections) {
    let libVars: LibraryVariable[];
    try {
      libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libColl.key);
    } catch (e) {
      warnings.push(
        `Failed to read variables in collection "${libColl.name}": ${errMessage(e)}`
      );
      continue;
    }
    for (const libVar of libVars) {
      try {
        const imported = await figma.variables.importVariableByKeyAsync(libVar.key);
        const coll = await getCollection(imported.variableCollectionId);
        const modeIdToName = new Map<string, string>();
        if (coll) for (const mode of coll.modes) modeIdToName.set(mode.modeId, mode.name);

        const valuesByMode: Record<string, ModeValue> = {};
        for (const [modeId, value] of Object.entries(imported.valuesByMode)) {
          valuesByMode[modeId] = {
            modeName: modeIdToName.get(modeId) || modeId,
            value: await serializeVariableValue(value),
          };
        }
        exportedVariables.push({
          id: imported.id,
          key: imported.key,
          name: imported.name,
          collection: coll ? coll.name : libColl.name,
          resolvedType: imported.resolvedType,
          valuesByMode,
          // teamLibrary only returns publishable (visible) variables - Figma never
          // exposes hidden variables to subscribers - so a remote variable is visible
          // by definition. importVariableByKeyAsync currently reports
          // hiddenFromPublishing: true for remote vars (unreliable); trust the real
          // value only for non-remote vars so a future Figma fix flows through.
          hiddenFromPublishing: imported.remote ? false : imported.hiddenFromPublishing,
          scopes: imported.scopes ? [...imported.scopes] : [],
        });
      } catch (e) {
        warnings.push(`Failed to import variable "${libVar.name}": ${errMessage(e)}`);
      }
    }
  }

  // --- Styles via REST key list + importStyleByKeyAsync ---
  const styleKeys = await fetchPublishedStyleKeys(fileKeyOrUrl, token);
  const styles: ExportedStyle[] = [];
  for (const key of styleKeys) {
    try {
      const style = await figma.importStyleByKeyAsync(key);
      styles.push(await serializeStyle(style));
    } catch (e) {
      warnings.push(`Failed to import style (key ${key}): ${errMessage(e)}`);
    }
  }

  // --- Components via REST key list + importComponent[Set]ByKeyAsync ---
  const components: ExportedComponent[] = [];
  const { componentKeys, componentSetKeys } = await fetchPublishedComponentKeys(
    fileKeyOrUrl,
    token
  );
  for (const key of componentSetKeys) {
    try {
      const set = await figma.importComponentSetByKeyAsync(key);
      components.push(serializeComponent(set));
    } catch (e) {
      warnings.push(`Failed to import component set (key ${key}): ${errMessage(e)}`);
    }
  }
  for (const key of componentKeys) {
    try {
      const comp = await figma.importComponentByKeyAsync(key);
      components.push(serializeComponent(comp));
    } catch (e) {
      warnings.push(`Failed to import component (key ${key}): ${errMessage(e)}`);
    }
  }

  return {
    snapshot: {
      schemaVersion: SCHEMA_VERSION,
      source: "baseline",
      exportedAt: new Date().toISOString(),
      libraryName: libraryName || undefined,
      variables: exportedVariables,
      styles,
      components,
    },
    warnings,
  };
}

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ----------------------------------------------------------------------------
// Message handling
// ----------------------------------------------------------------------------

interface ExportMessage {
  type: "export";
  mode: "current" | "baseline";
  libraryName?: string;
  fileKey?: string;
  token?: string;
}

interface ListLibrariesMessage {
  type: "list-libraries";
}

type IncomingMessage = ExportMessage | ListLibrariesMessage;

figma.showUI(__html__, { themeColors: true, width: 440, height: 600 });

figma.ui.onmessage = async (msg: IncomingMessage) => {
  try {
    if (msg.type === "list-libraries") {
      const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      const seen = new Set<string>();
      const libs: Array<{ libraryName: string }> = [];
      for (const c of cols) {
        if (!seen.has(c.libraryName)) {
          seen.add(c.libraryName);
          libs.push({ libraryName: c.libraryName });
        }
      }
      figma.ui.postMessage({ type: "libraries", data: libs });
      return;
    }

    if (msg.type === "export") {
      if (msg.mode === "current") {
        const snapshot = await exportCurrent();
        figma.ui.postMessage({ type: "result", data: snapshot, warnings: [] });
      } else {
        const { snapshot, warnings } = await exportBaseline(
          msg.libraryName || "",
          msg.fileKey || "",
          msg.token || ""
        );
        figma.ui.postMessage({ type: "result", data: snapshot, warnings });
      }
      return;
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: errMessage(e) });
  }
};
