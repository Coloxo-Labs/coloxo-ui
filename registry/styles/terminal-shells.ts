import type { TerminalShell } from "./terminal-types";

const SHELL_LABELS: Record<TerminalShell, string> = {
  bash: "bash",
  zsh: "zsh",
  powershell: "PowerShell",
  cmd: "cmd",
  fish: "fish",
  sh: "sh",
  terminal: "terminal",
};

const SHELL_PROMPTS: Record<TerminalShell, string> = {
  bash: "$",
  zsh: "%",
  powershell: "PS>",
  cmd: ">",
  fish: ">",
  sh: "$",
  terminal: "$",
};

export function getShellLabel(shell: TerminalShell): string {
  return SHELL_LABELS[shell];
}

export function getDefaultPrompt(shell: TerminalShell, cwd?: string): string {
  if (shell === "powershell" && cwd) {
    return `PS ${cwd}>`;
  }
  if (shell === "cmd" && cwd) {
    return `${cwd}>`;
  }
  return SHELL_PROMPTS[shell];
}

export function shouldShowCwdLine(shell: TerminalShell, cwd?: string): boolean {
  if (!cwd) return false;
  // PowerShell / cmd bake the path into the prompt.
  return shell !== "powershell" && shell !== "cmd";
}
