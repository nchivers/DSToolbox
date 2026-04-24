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

interface ModeValue {
  modeName: string;
  value: SerializedAlias | SerializedColor | string | number | boolean | null | undefined;
}

interface ExportedVariable {
  id: string;
  name: string;
  collection: string;
  resolvedType: string;
  valuesByMode: Record<string, ModeValue>;
  hiddenFromPublishing: boolean;
  scopes: string[];
}

type SerializedValue = SerializedAlias | SerializedColor | string | number | boolean | null | undefined;

function serializeVariableValue(
  value: VariableValue,
  variableIdToName: Map<string, string>
): SerializedValue {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === "object" && value !== null) {
    if ((value as VariableAlias).type === "VARIABLE_ALIAS") {
      const alias = value as VariableAlias;
      const result: SerializedAlias = { type: "VARIABLE_ALIAS", id: alias.id };
      if (variableIdToName.has(alias.id)) {
        result.name = variableIdToName.get(alias.id);
      }
      return result;
    }
    if ("r" in value && "g" in value && "b" in value) {
      const rgb = value as RGBA;
      const color: SerializedColor = { r: rgb.r, g: rgb.g, b: rgb.b };
      if ("a" in rgb) color.a = rgb.a;
      return color;
    }
  }
  return value as string | number | boolean;
}

function variableToExportShape(
  variable: Variable,
  collectionIdToName: Map<string, string>,
  modeIdToName: Map<string, string>,
  variableIdToName: Map<string, string>
): ExportedVariable {
  const collectionName =
    collectionIdToName.get(variable.variableCollectionId) ??
    variable.variableCollectionId;

  const valuesByMode: Record<string, ModeValue> = {};
  for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
    valuesByMode[modeId] = {
      modeName: modeIdToName.get(modeId) ?? modeId,
      value: serializeVariableValue(value, variableIdToName),
    };
  }

  return {
    id: variable.id,
    name: variable.name,
    collection: collectionName,
    resolvedType: variable.resolvedType,
    valuesByMode,
    hiddenFromPublishing: variable.hiddenFromPublishing,
    scopes: variable.scopes ? [...variable.scopes] : [],
  };
}

async function exportVariablesToJson(): Promise<ExportedVariable[]> {
  const [variables, collections] = await Promise.all([
    figma.variables.getLocalVariablesAsync(),
    figma.variables.getLocalVariableCollectionsAsync(),
  ]);

  const collectionIdToName = new Map<string, string>();
  const modeIdToName = new Map<string, string>();
  for (const coll of collections) {
    collectionIdToName.set(coll.id, coll.name);
    for (const mode of coll.modes) {
      modeIdToName.set(mode.modeId, mode.name);
    }
  }

  const variableIdToName = new Map<string, string>();
  for (const v of variables) {
    variableIdToName.set(v.id, v.name);
  }

  const aliasIds = new Set<string>();
  for (const v of variables) {
    for (const value of Object.values(v.valuesByMode)) {
      if (
        value &&
        typeof value === "object" &&
        (value as VariableAlias).type === "VARIABLE_ALIAS" &&
        !variableIdToName.has((value as VariableAlias).id)
      ) {
        aliasIds.add((value as VariableAlias).id);
      }
    }
  }

  for (const aid of aliasIds) {
    try {
      const resolved = await figma.variables.getVariableByIdAsync(aid);
      if (resolved?.name) variableIdToName.set(aid, resolved.name);
    } catch {
      // External variable may not be resolvable
    }
  }

  return variables.map((v) =>
    variableToExportShape(v, collectionIdToName, modeIdToName, variableIdToName)
  );
}

figma.showUI(__html__, { themeColors: true, width: 390, height: 500 });

figma.ui.onmessage = async (msg: { type: string }) => {
  if (msg.type === "export-variables") {
    try {
      const data = await exportVariablesToJson();
      figma.ui.postMessage({ type: "export-result", data });
    } catch (e) {
      figma.ui.postMessage({
        type: "export-error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }
};
