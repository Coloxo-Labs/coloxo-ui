import path from "node:path";
import type { ColoxoConfig } from "../project/config.js";
import type { RegistryFile, RegistryItem } from "../registry/schema.js";
import type { ProjectInfo } from "../project/detect.js";

/** Map alias like @/components/ui → filesystem path relative to cwd. */
export function resolveAliasToRelative(
  aliasPath: string,
  info: ProjectInfo,
): string {
  const normalized = aliasPath.replace(/\\/g, "/");
  let rel = normalized;

  if (rel.startsWith("@/")) {
    rel = rel.slice(2);
    if (info.hasSrcDir) {
      rel = path.join("src", rel);
    }
  } else if (rel.startsWith("~/")) {
    rel = rel.slice(2);
    if (info.hasSrcDir) {
      rel = path.join("src", rel);
    }
  }

  return rel.replace(/\\/g, "/");
}

export function resolveInstallPath(
  item: RegistryItem,
  file: RegistryFile,
  config: ColoxoConfig,
  info: ProjectInfo,
  cwd: string,
): { abs: string; rel: string; importBase: string } {
  const aliases = config.aliases;
  let importAlias: string;

  if (item.type === "registry:style") {
    importAlias = aliases.styles;
  } else if (item.type === "registry:lib" && item.slug === "utils") {
    importAlias = aliases.utils;
  } else {
    importAlias = aliases.components;
  }

  const relDir = resolveAliasToRelative(importAlias, info);
  const rel = path.join(relDir, file.target).replace(/\\/g, "/");
  return {
    rel,
    abs: path.join(cwd, rel),
    importBase: importAlias.replace(/\\/g, "/"),
  };
}
