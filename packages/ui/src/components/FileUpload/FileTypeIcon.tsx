"use client";

import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./FileTypeIcon.module.css";

export type FileTypeIconVariant = "default" | "solid";

const TYPE_META: Record<string, { label: string; tone: string }> = {
  pdf: { label: "PDF", tone: "pdf" },
  doc: { label: "DOC", tone: "doc" },
  docx: { label: "DOC", tone: "doc" },
  xls: { label: "XLS", tone: "xls" },
  xlsx: { label: "XLS", tone: "xls" },
  csv: { label: "CSV", tone: "xls" },
  png: { label: "PNG", tone: "img" },
  jpg: { label: "JPG", tone: "img" },
  jpeg: { label: "JPG", tone: "img" },
  gif: { label: "GIF", tone: "img" },
  svg: { label: "SVG", tone: "img" },
  webp: { label: "IMG", tone: "img" },
  mp4: { label: "MP4", tone: "video" },
  mov: { label: "MOV", tone: "video" },
  webm: { label: "VID", tone: "video" },
  mp3: { label: "MP3", tone: "audio" },
  wav: { label: "WAV", tone: "audio" },
  zip: { label: "ZIP", tone: "zip" },
  rar: { label: "RAR", tone: "zip" },
  ts: { label: "TS", tone: "code" },
  tsx: { label: "TSX", tone: "code" },
  js: { label: "JS", tone: "code" },
  jsx: { label: "JSX", tone: "code" },
  json: { label: "JSON", tone: "code" },
  txt: { label: "TXT", tone: "txt" },
};

export function extensionFromName(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

export type FileTypeIconProps = HTMLAttributes<HTMLSpanElement> & {
  /** File name or extension (e.g. `invoice.pdf` or `pdf`). */
  type?: string;
  variant?: FileTypeIconVariant;
};

export function FileTypeIcon({
  type = "",
  variant = "default",
  className,
  ...rest
}: FileTypeIconProps) {
  const ext = type.includes(".") ? extensionFromName(type) : type.toLowerCase();
  const meta = TYPE_META[ext] ?? { label: (ext || "FILE").slice(0, 4).toUpperCase(), tone: "empty" };

  return (
    <span
      className={cx(styles.root, styles[meta.tone], variant === "solid" && styles.solid, className)}
      aria-hidden="true"
      {...rest}
    >
      <span className={styles.fold} />
      <span className={styles.label}>{meta.label}</span>
    </span>
  );
}
