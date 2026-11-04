"use client";
import { CircleCheckIcon, CircleXIcon, Trash2Icon, UploadIcon } from "@/lib/icons";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { FeaturedIcon } from "./featured-icon";
import { FormField } from "./form-field";
import { Icon } from "./icon";
import { cx, useId } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  bar: "h-full rounded-full bg-cx-brand",
  body: "min-w-0 flex-1",
  delete:
    "inline-flex h-7 w-7 items-center justify-center rounded-md text-cx-tertiary hover:bg-cx-secondary",
  drop: "flex flex-col items-center gap-3 rounded-xl border border-dashed border-cx-secondary bg-cx-primary px-6 py-8 text-center",
  hint: "m-0 text-sm text-cx-tertiary",
  item: "relative flex items-start gap-3 overflow-hidden rounded-xl border border-solid border-cx-secondary bg-cx-primary p-3",
  link: "font-semibold text-cx-brand",
  list: "m-0 flex list-none flex-col gap-3 p-0",
  name: "m-0 truncate text-sm font-medium text-cx-primary",
  over: "border-cx-brand bg-cx-secondary",
  size: "m-0 text-sm text-cx-tertiary",
  track: "h-2 flex-1 overflow-hidden rounded-full bg-cx-secondary",
};

const TONE: Record<string, string> = {
  pdf: "bg-red-600",
  doc: "bg-blue-600",
  xls: "bg-green-600",
  img: "bg-violet-600",
  video: "bg-pink-600",
  audio: "bg-amber-600",
  zip: "bg-slate-600",
  code: "bg-cyan-700",
  txt: "bg-slate-500",
  empty: "bg-slate-400",
};

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

export type FileTypeIconVariant = "default" | "solid";

export function extensionFromName(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

export type FileTypeIconProps = HTMLAttributes<HTMLSpanElement> & {
  type?: string;
  variant?: FileTypeIconVariant;
};

export function FileTypeIcon({
  type = "",
  variant = "default",
  className,
  ...rest
}: FileTypeIconProps) {
  const ext =
    type.includes(".") || type.includes("/") ? extensionFromName(type) : type.toLowerCase();
  const meta = TYPE_META[ext] ?? {
    label: (ext || "FILE").slice(0, 4).toUpperCase(),
    tone: "empty",
  };
  return (
    <span
      className={cx(
        "relative inline-flex h-10 w-8 items-end justify-center rounded-md pb-1 text-[10px] font-bold text-white",
        TONE[meta.tone],
        variant === "solid" && "h-9 w-9 rounded-lg",
        className,
      )}
      aria-hidden="true"
      {...rest}
    >
      {meta.label}
    </span>
  );
}

export type FileListItemProgressVariant = "bar" | "fill";

export type FileListItemProps = HTMLAttributes<HTMLLIElement> & {
  name: string;
  size: number;
  progress?: number;
  failed?: boolean;
  type?: string;
  thumbnailUrl?: string;
  progressVariant?: FileListItemProgressVariant;
  onDelete?: () => void;
  onRetry?: () => void;
  statusLabel?: ReactNode;
};

export function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";
  const suffixes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(suffixes.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${Math.floor(bytes / Math.pow(1024, i))} ${suffixes[i]}`;
}

export function FileListItem({
  name,
  size,
  progress = 0,
  failed = false,
  type,
  thumbnailUrl,
  progressVariant = "bar",
  onDelete,
  onRetry,
  statusLabel,
  className,
  ...rest
}: FileListItemProps) {
  const pct = Math.max(0, Math.min(100, progress));
  const isComplete = !failed && pct >= 100;
  const leading = thumbnailUrl ? (
    <img src={thumbnailUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
  ) : (
    <FileTypeIcon type={type ?? name} variant={progressVariant === "fill" ? "solid" : "default"} />
  );

  return (
    <li className={cx(CX.item, failed && "border-cx-error", className)} {...rest}>
      {progressVariant === "fill" && !failed ? (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 bg-cx-secondary"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      ) : null}
      <span className="relative">{leading}</span>
      <div className={cx(CX.body, "relative")}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className={CX.name}>{name}</p>
            <p className={CX.size}>
              {failed ? "Upload failed, please try again" : formatFileSize(size)}
              <span className="px-1" aria-hidden>
                ·
              </span>
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-cx-success">
                  <Icon size="sm">
                    <CircleCheckIcon />
                  </Icon>
                  {statusLabel ?? "Complete"}
                </span>
              ) : null}
              {!failed && !isComplete ? (
                <span className="inline-flex items-center gap-1">
                  <Icon size="sm">
                    <UploadIcon />
                  </Icon>
                  {statusLabel ?? "Uploading..."}
                </span>
              ) : null}
              {failed ? (
                <span className="inline-flex items-center gap-1 text-cx-error">
                  <Icon size="sm">
                    <CircleXIcon />
                  </Icon>
                  {statusLabel ?? "Failed"}
                </span>
              ) : null}
            </p>
          </div>
          {onDelete ? (
            <button
              type="button"
              className={CX.delete}
              aria-label={`Delete ${name}`}
              onClick={onDelete}
            >
              <Icon size="sm">
                <Trash2Icon />
              </Icon>
            </button>
          ) : null}
        </div>
        {progressVariant === "bar" && !failed ? (
          <div className="mt-2 flex items-center gap-2">
            <div
              className={CX.track}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className={CX.bar} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-cx-tertiary">{pct}%</span>
          </div>
        ) : null}
        {failed && onRetry ? (
          <button
            type="button"
            className="mt-1 text-sm font-semibold text-cx-brand"
            onClick={onRetry}
          >
            Try again
          </button>
        ) : null}
      </div>
    </li>
  );
}

export type UploadFile = {
  id: string;
  file?: File;
  name?: string;
  size?: number;
  type?: string;
  thumbnailUrl?: string;
  progress?: number;
  error?: string;
  status?: "queued" | "uploading" | "success" | "error";
  failed?: boolean;
};

export type FileUploadProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  files?: UploadFile[];
  onFilesChange?: (files: UploadFile[]) => void;
  onRetry?: (file: UploadFile) => void;
  progressVariant?: FileListItemProgressVariant;
  disabled?: boolean;
  id?: string;
  className?: string;
  name?: string;
};

function toUploadFile(file: File): UploadFile {
  const isImage = file.type.startsWith("image/");
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
    file,
    name: file.name,
    size: file.size,
    type: extensionFromName(file.name) || file.type,
    thumbnailUrl: isImage ? URL.createObjectURL(file) : undefined,
    progress: 0,
    status: "queued",
    failed: false,
  };
}

function revokeThumbnail(item: UploadFile) {
  if (item.thumbnailUrl?.startsWith("blob:")) URL.revokeObjectURL(item.thumbnailUrl);
}

function isFileTypeAccepted(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(",").some((acceptedType) => {
    const token = acceptedType.trim();
    if (token.startsWith(".")) {
      return `.${file.name.split(".").pop()?.toLowerCase()}` === token.toLowerCase();
    }
    if (token.endsWith("/*")) return file.type.startsWith(`${token.split("/")[0]}/`);
    return file.type === token;
  });
}

function normalizeUpload(item: UploadFile): UploadFile & { name: string; size: number } {
  const name = item.name || item.file?.name || "file";
  return {
    ...item,
    name,
    size: item.size ?? item.file?.size ?? 0,
    type: item.type ?? extensionFromName(name),
    failed: item.failed ?? item.status === "error",
    progress: item.progress ?? (item.status === "success" ? 100 : 0),
  };
}

export function FileUpload({
  label,
  required,
  optional,
  description,
  hint,
  error,
  accept,
  multiple = true,
  maxSize,
  maxFiles,
  files: controlledFiles,
  onFilesChange,
  onRetry,
  progressVariant = "bar",
  disabled,
  id,
  className,
  name,
}: FileUploadProps) {
  const inputId = useId(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [invalidHint, setInvalidHint] = useState(false);
  const rawFiles = controlledFiles ?? internal;
  const files = rawFiles.map(normalizeUpload);

  const setFiles = useCallback(
    (next: UploadFile[]) => {
      if (controlledFiles === undefined) setInternal(next);
      onFilesChange?.(next);
    },
    [controlledFiles, onFilesChange],
  );

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      setInvalidHint(false);
      const next: UploadFile[] = [...rawFiles];
      let sawInvalid = false;
      for (const file of Array.from(list)) {
        if (!multiple && next.length >= 1) break;
        if (maxFiles && next.length >= maxFiles) break;
        if (maxSize && file.size > maxSize) {
          sawInvalid = true;
          const item = toUploadFile(file);
          item.status = "error";
          item.failed = true;
          item.error = `File exceeds ${formatFileSize(maxSize)}`;
          next.push(item);
          continue;
        }
        if (!isFileTypeAccepted(file, accept)) {
          sawInvalid = true;
          continue;
        }
        next.push(toUploadFile(file));
      }
      if (sawInvalid) setInvalidHint(true);
      setFiles(next);
    },
    [accept, maxFiles, maxSize, multiple, rawFiles, setFiles],
  );

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    const removed = rawFiles.find((item) => item.id === fileId);
    if (removed) revokeThumbnail(removed);
    setFiles(rawFiles.filter((item) => item.id !== fileId));
  };

  const defaultHint =
    hint ??
    (accept
      ? `${accept}${maxSize ? ` (max. ${formatFileSize(maxSize)})` : ""}`
      : maxSize
        ? `Any file type (max. ${formatFileSize(maxSize)})`
        : "SVG, PNG, JPG or GIF (max. 800x400px)");

  const control = (
    <div className={cx("flex w-full flex-col gap-3", className)}>
      <div
        className={cx(
          CX.drop,
          dragOver && CX.over,
          disabled && "opacity-50",
          (invalidHint || error) && "border-cx-error",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <FeaturedIcon type="modern" color="gray" size="md">
          <UploadIcon />
        </FeaturedIcon>
        <div>
          <input
            ref={inputRef}
            id={inputId}
            className="sr-only"
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className={CX.link}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Click to upload
          </button>
          <span className="text-sm text-cx-secondary"> or drag and drop</span>
          <p className={cx(CX.hint, invalidHint && "text-cx-error")}>{defaultHint}</p>
        </div>
      </div>
      {files.length > 0 ? (
        <ul className={CX.list}>
          {files.map((item) => (
            <FileListItem
              key={item.id}
              name={item.name}
              size={item.size}
              type={item.type ?? item.name}
              thumbnailUrl={item.thumbnailUrl}
              progress={item.progress ?? 0}
              failed={Boolean(item.failed || item.status === "error")}
              progressVariant={progressVariant}
              onDelete={() => removeFile(item.id)}
              onRetry={() => {
                if (onRetry) {
                  onRetry(item);
                  return;
                }
                setFiles(
                  rawFiles.map((file) =>
                    file.id === item.id
                      ? {
                          ...file,
                          failed: false,
                          status: "uploading",
                          progress: 0,
                          error: undefined,
                        }
                      : file,
                  ),
                );
              }}
              statusLabel={item.failed || item.status === "error" ? item.error : undefined}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );

  if (!label && !description && !error) return control;
  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      optional={optional}
      description={description}
      error={error}
    >
      {control}
    </FormField>
  );
}
