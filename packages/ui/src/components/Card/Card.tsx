"use client";

import {
  createElement,
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import styles from "./Card.module.css";

export type CardVariant =
  | "outline"
  | "default"
  | "bordered"
  | "elevated"
  | "flat"
  | "filled"
  | "neumorphic"
  | "material"
  | "clay"
  | "brutalist"
  | "glassGradient"
  | "bento"
  | "inset"
  | "gradient"
  | "carbon"
  | "aurora"
  | "skeuomorphic"
  | "paper"
  | "ghost"
  | "holographic"
  | "retro";

/** Catalog of visual styles for docs and playgrounds. */
export const CARD_VARIANTS: ReadonlyArray<{
  value: CardVariant;
  label: string;
  description: string;
  bestFor: string;
  category: "surface" | "effect" | "layout" | "visual";
}> = [
  {
    value: "default",
    label: "Default",
    description: "Clean white surface with soft border and shadow.",
    bestFor: "General content, forms, lists",
    category: "surface",
  },
  {
    value: "elevated",
    label: "Elevated",
    description: "Lifted solid card with pronounced soft shadow.",
    bestFor: "Enterprise SaaS, dashboards",
    category: "surface",
  },
  {
    value: "outline",
    label: "Outlined",
    description: "Dashed border defines the card, no shadow.",
    bestFor: "Dense dashboards, filters",
    category: "surface",
  },
  {
    value: "filled",
    label: "Filled",
    description: "Solid brand-tinted fill without elevation.",
    bestFor: "Highlights, grouped content",
    category: "surface",
  },
  {
    value: "inset",
    label: "Inset",
    description: "Recessed surface with inner shadow.",
    bestFor: "Controls, settings panels",
    category: "surface",
  },
  {
    value: "ghost",
    label: "Transparent",
    description: "Light surface with blur and thin edge.",
    bestFor: "Minimal overlays, secondary panels",
    category: "surface",
  },
  {
    value: "neumorphic",
    label: "Neumorphism",
    description: "Soft extruded dual-shadow surface.",
    bestFor: "Minimal interfaces, controls",
    category: "effect",
  },
  {
    value: "clay",
    label: "Claymorphism",
    description: "Chunky inflated shape with soft highlights.",
    bestFor: "Friendly / creative products",
    category: "effect",
  },
  {
    value: "aurora",
    label: "Aurora / Glow",
    description: "Soft brand glow around the card.",
    bestFor: "Modern SaaS, AI products",
    category: "effect",
  },
  {
    value: "holographic",
    label: "Holographic",
    description: "Iridescent brand wash with sheen.",
    bestFor: "Creative / experimental UI",
    category: "effect",
  },
  {
    value: "bento",
    label: "Bento",
    description: "Modular tile with brand accent rail.",
    bestFor: "Dashboards, landing modules",
    category: "layout",
  },
  {
    value: "material",
    label: "Material",
    description: "Structured elevation with brand-tinted depth.",
    bestFor: "Apps, product dashboards",
    category: "visual",
  },
  {
    value: "brutalist",
    label: "Brutalist",
    description: "Hard border with offset brand shadow.",
    bestFor: "Creative / design sites",
    category: "visual",
  },
  {
    value: "paper",
    label: "Editorial",
    description: "Paper-like surface for long-form content.",
    bestFor: "Articles, content-heavy apps",
    category: "visual",
  },
  {
    value: "skeuomorphic",
    label: "Skeuomorphic",
    description: "Physical bevel and inset light.",
    bestFor: "Specialized tactile UI",
    category: "visual",
  },
  {
    value: "retro",
    label: "Retro / Y2K",
    description: "Chunky brand border and playful offset.",
    bestFor: "Expressive / nostalgic UI",
    category: "visual",
  },
  {
    value: "flat",
    label: "Flat",
    description: "Solid fill, no shadow.",
    bestFor: "Enterprise apps, clean SaaS",
    category: "surface",
  },
  {
    value: "glassGradient",
    label: "Glass + Gradient",
    description: "Frosted glass over brand wash.",
    bestFor: "Marketing, AI products",
    category: "effect",
  },
  {
    value: "gradient",
    label: "Gradient",
    description: "Brand gradient fill with light content.",
    bestFor: "Stats, featured content",
    category: "visual",
  },
  {
    value: "carbon",
    label: "Carbon",
    description: "Dark surface with brand-edged highlight.",
    bestFor: "Developer tools, analytics",
    category: "visual",
  },
  {
    value: "bordered",
    label: "Bordered",
    description: "Strong solid outline without elevation.",
    bestFor: "Structured layouts",
    category: "surface",
  },
];

export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Visual surface style. */
  variant?: CardVariant;
  /** Body padding when using the simple title/footer API. */
  padding?: CardPadding;
  title?: ReactNode;
  description?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
};

function CardRoot({
  variant = "outline",
  padding = "md",
  title,
  description,
  header,
  footer,
  className,
  children,
  ...rest
}: CardProps) {
  const useSimpleLayout = Boolean(header || title || description || footer);

  return (
    <div
      className={cx(styles.root, styles[variant] ?? "", className)}
      data-variant={variant}
      {...rest}
    >
      {useSimpleLayout ? (
        <>
          {header || title || description ? (
            <div className={styles.header}>
              {header ?? (
                <>
                  {title ? <div className={styles.title}>{title}</div> : null}
                  {description ? <div className={styles.description}>{description}</div> : null}
                </>
              )}
            </div>
          ) : null}
          {children != null ? (
            <div className={cx(styles.body, styles[`pad-${padding}`] ?? "")}>{children}</div>
          ) : null}
          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </>
      ) : (
        children
      )}
    </div>
  );
}

/* —— CardHeader —— */

export type CardHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  /** Supporting text under the title */
  subheader?: ReactNode;
  avatar?: ReactNode;
  action?: ReactNode;
  disableTypography?: boolean;
};

export function CardHeader({
  title,
  subheader,
  avatar,
  action,
  disableTypography,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  return (
    <div className={cx(styles.cardHeader, className)} {...rest}>
      {avatar ? <div className={styles.cardHeaderAvatar}>{avatar}</div> : null}
      <div className={styles.cardHeaderContent}>
        {title != null ? (
          disableTypography ? (
            title
          ) : (
            <div className={styles.cardHeaderTitle}>{title}</div>
          )
        ) : null}
        {subheader != null ? (
          disableTypography ? (
            subheader
          ) : (
            <div className={styles.cardHeaderSubheader}>{subheader}</div>
          )
        ) : null}
        {children}
      </div>
      {action ? <div className={styles.cardHeaderAction}>{action}</div> : null}
    </div>
  );
}

/* —— CardContent —— */

export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  /** Optional padding override (defaults to md). */
  padding?: CardPadding;
  component?: ElementType;
};

export function CardContent({
  padding = "md",
  component = "div",
  className,
  children,
  ...rest
}: CardContentProps) {
  return createElement(
    component,
    {
      className: cx(styles.cardContent, styles[`pad-${padding}`] ?? "", className),
      ...rest,
    },
    children,
  );
}

/* —— CardMedia —— */

export type CardMediaProps = HTMLAttributes<HTMLElement> & {
  /** Background-image URL when using the default `div` media surface. */
  image?: string;
  /** Alias for media `src` when `component` is img/video/audio/iframe. */
  src?: string;
  /** Root element type — `div` (bg image), `img`, `video`, etc. */
  component?: ElementType;
  /** Explicit height (number → px). Required for background-image media. */
  height?: number | string;
  alt?: string;
  title?: string;
};

export function CardMedia({
  image,
  src,
  component = "div",
  height,
  alt,
  title,
  className,
  style,
  children,
  ...rest
}: CardMediaProps) {
  const isMediaElement =
    component === "img" ||
    component === "video" ||
    component === "audio" ||
    component === "picture" ||
    component === "iframe";

  const heightStyle: CSSProperties | undefined =
    height == null ? undefined : { height: typeof height === "number" ? `${height}px` : height };

  if (isMediaElement) {
    return createElement(component, {
      className: cx(styles.cardMedia, styles.cardMediaElement, className),
      style: { ...heightStyle, ...style },
      src: src ?? image,
      alt: component === "img" ? (alt ?? title ?? "") : alt,
      title,
      children:
        component === "picture" || component === "video" || component === "audio"
          ? children
          : undefined,
      ...rest,
    });
  }

  return createElement(
    component,
    {
      className: cx(styles.cardMedia, styles.cardMediaSurface, className),
      style: {
        ...heightStyle,
        ...(image || src ? { backgroundImage: `url(${image ?? src})` } : null),
        ...style,
      },
      role: image || src ? "img" : undefined,
      "aria-label": alt ?? title,
      title,
      ...rest,
    },
    children,
  );
}

/* —— CardActions —— */

export type CardActionsProps = HTMLAttributes<HTMLDivElement> & {
  /** When true, remove default action spacing. */
  disableSpacing?: boolean;
};

export function CardActions({
  disableSpacing = false,
  className,
  children,
  ...rest
}: CardActionsProps) {
  return (
    <div
      className={cx(styles.cardActions, !disableSpacing && styles.cardActionsSpacing, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/* —— CardActionArea —— */

export type CardActionAreaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  component?: ElementType;
  /** When true, marks the area as selected/pressed for `data-active` styles. */
  active?: boolean;
};

export const CardActionArea = forwardRef<HTMLElement, CardActionAreaProps>(function CardActionArea(
  {
    href,
    component,
    active,
    className,
    children,
    disabled,
    type = "button",
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onKeyDown,
    onKeyUp,
    onBlur,
    ...rest
  },
  ref,
) {
  const [pressed, setPressed] = useState(false);
  const isActive = active ?? pressed;
  const Comp: ElementType = component ?? (href ? "a" : "button");
  const isButton = Comp === "button";

  return createElement(
    Comp,
    {
      ref,
      href: href && !disabled ? href : undefined,
      type: isButton ? type : undefined,
      disabled: isButton ? disabled : undefined,
      "aria-disabled": !isButton && disabled ? true : undefined,
      className: cx(styles.cardActionArea, disabled && styles.cardActionAreaDisabled, className),
      "data-active": isActive ? "true" : undefined,
      onMouseDown: (e: MouseEvent<HTMLElement>) => {
        if (!disabled) setPressed(true);
        onMouseDown?.(e as MouseEvent<HTMLButtonElement>);
      },
      onMouseUp: (e: MouseEvent<HTMLElement>) => {
        setPressed(false);
        onMouseUp?.(e as MouseEvent<HTMLButtonElement>);
      },
      onMouseLeave: (e: MouseEvent<HTMLElement>) => {
        setPressed(false);
        onMouseLeave?.(e as MouseEvent<HTMLButtonElement>);
      },
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        if (!disabled && (e.key === " " || e.key === "Enter")) setPressed(true);
        onKeyDown?.(e as KeyboardEvent<HTMLButtonElement>);
      },
      onKeyUp: (e: KeyboardEvent<HTMLElement>) => {
        setPressed(false);
        onKeyUp?.(e as KeyboardEvent<HTMLButtonElement>);
      },
      onBlur: (e: FocusEvent<HTMLElement>) => {
        setPressed(false);
        onBlur?.(e as FocusEvent<HTMLButtonElement>);
      },
      ...rest,
    },
    children,
    createElement("span", {
      className: styles.cardActionAreaFocus,
      "aria-hidden": "true",
    }),
  );
});

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Media: CardMedia,
  Actions: CardActions,
  ActionArea: CardActionArea,
});
