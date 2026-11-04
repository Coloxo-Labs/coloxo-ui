import type { ImgHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import type { AvatarSize } from "./Avatar";
import styles from "./AvatarCompanyIcon.module.css";

export type AvatarCompanyIconProps = ImgHTMLAttributes<HTMLImageElement> & {
  size?: AvatarSize;
  src: string;
};

/** Small company logo badge for Avatar `badge` prop. */
export function AvatarCompanyIcon({
  size = "md",
  src,
  alt = "",
  className,
  ...rest
}: AvatarCompanyIconProps) {
  const sizeClass = size === "2xl" ? styles.size2xl : styles[size];
  return <img className={cx(styles.root, sizeClass, className)} src={src} alt={alt} {...rest} />;
}
