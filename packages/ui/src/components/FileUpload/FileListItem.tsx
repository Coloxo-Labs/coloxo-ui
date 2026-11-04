"use client";
import { UploadIcon, CircleCheckIcon, Trash2Icon, CircleXIcon } from "../../icons";

import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { cx } from "../../utils/cx";
import { FileTypeIcon, extensionFromName } from "./FileTypeIcon";
import styles from "./FileListItem.module.css";

export type FileListItemProgressVariant = "bar" | "fill";

export type FileListItemProps = HTMLAttributes<HTMLLIElement> & {
  name: string;
  size: number;
  progress?: number;
  failed?: boolean;
  /** MIME type or extension / filename for the type glyph. */
  type?: string;
  /** Image preview URL (object URL or remote). Shown instead of the type icon when set. */
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
  const isUploading = !failed && !isComplete;
  const ext = type ?? name;
  const iconVariant = progressVariant === "fill" ? "solid" : "default";
  const leading = thumbnailUrl ? (
    <span className={cx(styles.thumb, progressVariant === "fill" && styles.iconRel)}>
      <img src={thumbnailUrl} alt="" />
    </span>
  ) : (
    <FileTypeIcon
      type={ext}
      variant={iconVariant}
      className={progressVariant === "fill" ? styles.iconRel : undefined}
    />
  );

  if (progressVariant === "fill") {
    return (
      <li className={cx(styles.itemFill, failed && styles.failed, className)} {...rest}>
        {!failed ? (
          <div
            className={cx(styles.fillLayer, isComplete && styles.fillDone)}
            style={{ transform: `translateX(-${100 - pct}%)` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        ) : null}
        <div className={cx(styles.fillRing, failed && styles.fillRingFailed)} />
        {leading}
        <div className={styles.bodyRel}>
          <div className={styles.row}>
            <div className={styles.meta}>
              <p className={styles.name}>{name}</p>
              <div className={styles.statusRow}>
                <p className={styles.size}>
                  {failed ? "Upload failed, please try again" : formatFileSize(size)}
                </p>
                {!failed ? (
                  <>
                    <span className={styles.divider} aria-hidden />
                    <span className={styles.statusInline}>
                      {isComplete ? (
                        <Icon size="sm" className={styles.successIcon}>
                          <CircleCheckIcon />
                        </Icon>
                      ) : (
                        <Icon size="sm" className={styles.mutedIcon}>
                          <UploadIcon />
                        </Icon>
                      )}
                      <span className={styles.pct}>{pct}%</span>
                    </span>
                  </>
                ) : null}
              </div>
              {failed && onRetry ? (
                <button type="button" className={styles.retry} onClick={onRetry}>
                  Try again
                </button>
              ) : null}
            </div>
            {onDelete ? (
              <IconButton
                aria-label={`Delete ${name}`}
                variant="tertiary"
                size="xs"
                className={styles.delete}
                onClick={onDelete}
              >
                <Trash2Icon />
              </IconButton>
            ) : null}
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={cx(styles.item, failed && styles.failed, className)} {...rest}>
      {leading}
      <div className={styles.body}>
        <div className={styles.row}>
          <div className={styles.meta}>
            <p className={styles.name}>{name}</p>
            <div className={styles.statusRow}>
              <p className={styles.size}>{formatFileSize(size)}</p>
              <span className={styles.divider} aria-hidden />
              <span className={styles.statusInline}>
                {isComplete ? (
                  <>
                    <Icon size="sm" className={styles.successIcon}>
                      <CircleCheckIcon />
                    </Icon>
                    <span className={styles.successText}>{statusLabel ?? "Complete"}</span>
                  </>
                ) : null}
                {isUploading ? (
                  <>
                    <Icon size="sm" className={styles.mutedIcon}>
                      <UploadIcon />
                    </Icon>
                    <span className={styles.uploadingText}>{statusLabel ?? "Uploading..."}</span>
                  </>
                ) : null}
                {failed ? (
                  <>
                    <Icon size="sm" className={styles.errorIcon}>
                      <CircleXIcon />
                    </Icon>
                    <span className={styles.errorText}>{statusLabel ?? "Failed"}</span>
                  </>
                ) : null}
              </span>
            </div>
          </div>
          {onDelete ? (
            <IconButton
              aria-label={`Delete ${name}`}
              variant="tertiary"
              size="xs"
              className={styles.delete}
              onClick={onDelete}
            >
              <Trash2Icon />
            </IconButton>
          ) : null}
        </div>

        {!failed ? (
          <div className={styles.progressRow}>
            <div
              className={styles.track}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className={styles.bar} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.pct}>{pct}%</span>
          </div>
        ) : null}

        {failed && onRetry ? (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    </li>
  );
}

export { extensionFromName };
