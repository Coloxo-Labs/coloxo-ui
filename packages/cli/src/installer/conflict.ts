import fs from "node:fs/promises";
import * as p from "@clack/prompts";
import pc from "picocolors";

export type ConflictPolicy = {
  overwrite: boolean;
  yes: boolean;
  /**
   * Targets that already exist, discovered before any file is written.
   * Used to ask once per conflict instead of mid-install.
   */
  preflightConflicts?: string[];
};

export async function shouldWriteFile(
  absPath: string,
  policy: ConflictPolicy,
): Promise<boolean> {
  let exists = false;
  try {
    await fs.access(absPath);
    exists = true;
  } catch {
    return true;
  }

  if (!exists) return true;
  if (policy.overwrite) return true;
  if (policy.yes) return false;

  const answer = await p.confirm({
    message: `File ${pc.cyan(absPath)} already exists. Overwrite?`,
    initialValue: false,
  });

  if (p.isCancel(answer)) {
    p.cancel("Operation cancelled.");
    process.exit(1);
  }

  return answer === true;
}
