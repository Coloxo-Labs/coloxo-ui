"use client";
import { UploadIcon } from "../../icons";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { FormField } from "../FormField/FormField";
import { FeaturedIcon } from "../FeaturedIcon/FeaturedIcon";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import { FileListItem, type FileListItemProgressVariant, formatFileSize } from "./FileListItem";
import { extensionFromName } from "./FileTypeIcon";
import styles from "./FileUpload.module.css";

export type UploadFile = {
  id: string;
  /** Native File when available (new selections). */
  file?: File;
  name?: string;
  size?: number;
  /** Extension or mime hint for the type icon. */
  type?: string;
  /** Image preview URL (object URL or remote thumbnail). */
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
  /** Dropzone hint under the CTA (Untitled `hint`). */
  hint?: ReactNode;
  error?: ReactNode;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  files?: UploadFile[];
  onFilesChange?: (files: UploadFile[]) => void;
  onRetry?: (file: UploadFile) => void;
  /** `bar` = progress bar + %; `fill` = card background fill. */
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
  if (item.thumbnailUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(item.thumbnailUrl);
  }
}

function isFileTypeAccepted(file: File, accept?: string): boolean {
  if (!accept) return true;
  const acceptedTypes = accept.split(",").map((t) => t.trim());
  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.startsWith(".")) {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      return extension === acceptedType.toLowerCase();
    }
    if (acceptedType.endsWith("/*")) {
      const typePrefix = acceptedType.split("/")[0];
      return file.type.startsWith(`${typePrefix}/`);
    }
    return file.type === acceptedType;
  });
}

function normalizeUpload(item: UploadFile): UploadFile & { name: string; size: number } {
  const name = item.name || item.file?.name || "file";
  const size = item.size ?? item.file?.size ?? 0;
  const failed = item.failed ?? item.status === "error";
  const progress =
    item.progress ?? (item.status === "success" ? 100 : item.status === "uploading" ? 0 : 0);
  return {
    ...item,
    name,
    size,
    type: item.type ?? extensionFromName(name),
    failed,
    progress,
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
      const incoming = Array.from(list);
      const next: UploadFile[] = [...rawFiles];
      let sawInvalid = false;

      for (const file of incoming) {
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

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

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

  const retryFile = (item: UploadFile) => {
    if (onRetry) {
      onRetry(item);
      return;
    }
    setFiles(
      rawFiles.map((f) =>
        f.id === item.id
          ? { ...f, failed: false, status: "uploading", progress: 0, error: undefined }
          : f,
      ),
    );
  };

  const defaultHint =
    hint ??
    (accept
      ? `${accept}${maxSize ? ` (max. ${formatFileSize(maxSize)})` : ""}`
      : maxSize
        ? `Any file type (max. ${formatFileSize(maxSize)})`
        : "SVG, PNG, JPG or GIF (max. 800x400px)");

  const control = (
    <div className={cx(styles.root, className)}>
      <div
        className={cx(
          styles.dropzone,
          dragOver && styles.over,
          disabled && styles.disabled,
          invalidHint && styles.invalid,
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        data-dropzone=""
      >
        <FeaturedIcon
          type="modern"
          color="gray"
          size="md"
          className={disabled ? styles.iconDisabled : undefined}
        >
          <UploadIcon />
        </FeaturedIcon>

        <div className={styles.copy}>
          <div className={styles.cta}>
            <input
              ref={inputRef}
              id={inputId}
              className={styles.input}
              type="file"
              name={name}
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              onChange={onInputChange}
            />
            <button
              type="button"
              className={styles.link}
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Click to upload
            </button>
            <span className={styles.orDrop}> or drag and drop</span>
          </div>
          <p className={cx(styles.hint, invalidHint && styles.hintInvalid)}>{defaultHint}</p>
        </div>
      </div>

      {files.length > 0 ? (
        <ul className={styles.list}>
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
              onRetry={() => retryFile(item)}
              statusLabel={
                item.status === "error" || item.failed
                  ? item.error
                    ? undefined
                    : "Failed"
                  : undefined
              }
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

export { FileListItem, formatFileSize } from "./FileListItem";
export type { FileListItemProps, FileListItemProgressVariant } from "./FileListItem";
export { FileTypeIcon, extensionFromName } from "./FileTypeIcon";
export type { FileTypeIconProps, FileTypeIconVariant } from "./FileTypeIcon";
