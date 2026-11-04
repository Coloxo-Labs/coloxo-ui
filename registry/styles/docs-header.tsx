"use client";
import { MenuIcon, ChevronDownIcon } from "@/lib/icons";

import type { ReactNode } from "react";
import { Dropdown, DropdownItem } from "./dropdown";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  actions: "inline-flex items-center gap-2",
  brand: "flex items-center gap-2.5 min-w-0",
  brandLabel: "text-sm font-semibold text-cx-primary",
  brandMeta: "text-xs text-cx-tertiary",
  brandText: "flex flex-col min-w-0",
  dropdownLink: "flex items-center gap-2 w-full text-inherit outline-none",
  dropdownLinkActive: "text-cx-brand-secondary bg-cx-brand-soft",
  end: "flex items-center gap-3 shrink-0",
  logo: "inline-flex shrink-0",
  menuButton: "hidden",
  nav: "hidden lg:block",
  navBadge: "inline-flex",
  navChevron: "transition-transform",
  navLink:
    "inline-flex items-center gap-1.5 m-0 py-2 px-2.5 border-none rounded-md bg-transparent text-cx-secondary text-sm font-medium cursor-pointer transition-colors hover:bg-cx-primary-hover hover:text-cx-primary focus-visible:outline",
  navLinkActive: "text-cx-brand-secondary bg-cx-brand-soft",
  navList: "flex items-center gap-1 m-0 p-0",
  root: "flex items-center gap-4 py-3 px-4 bg-cx-primary font-sans",
  search: "flex-1 min-w-0 max-w-[28rem]",
  start: "flex items-center gap-2 shrink-0",
};

export type DocsHeaderNavItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
  /** When set, renders as a dropdown instead of a direct link. */
  children?: DocsHeaderNavItem[];
};

export type DocsHeaderProps = {
  logo?: ReactNode;
  brandLabel?: string;
  brandMeta?: string;
  navItems?: DocsHeaderNavItem[];
  search?: ReactNode;
  actions?: ReactNode;
  onMenuClick?: () => void;
  className?: string;
};

function NavLinkContent({ item }: { item: DocsHeaderNavItem }) {
  return (
    <>
      {item.label}
      {item.badge ? <span className={CX.navBadge}>{item.badge}</span> : null}
    </>
  );
}

function NavDropdown({ item }: { item: DocsHeaderNavItem }) {
  const children = item.children ?? [];
  return (
    <Dropdown
      align="end"
      trigger={
        <button
          type="button"
          className={cx(CX.navLink, item.active && CX.navLinkActive)}
          aria-current={item.active ? "true" : undefined}
        >
          <NavLinkContent item={item} />
          <Icon size="sm" className={CX.navChevron}>
            <ChevronDownIcon />
          </Icon>
        </button>
      }
    >
      {children.map((child) =>
        child.href ? (
          <DropdownItem
            key={child.id}
            asChild
            className={
              "flex items-center gap-2 p-2 rounded-md text-sm text-cx-secondary cursor-pointer outline-none"
            }
          >
            <a
              href={child.href}
              className={cx(CX.dropdownLink, child.active && CX.dropdownLinkActive)}
              aria-current={child.active ? "page" : undefined}
              onClick={child.onClick}
            >
              {child.label}
              {child.badge ? <span className={CX.navBadge}>{child.badge}</span> : null}
            </a>
          </DropdownItem>
        ) : (
          <DropdownItem
            key={child.id}
            className={cx(
              "flex items-center gap-2 p-2 rounded-md text-sm text-cx-secondary cursor-pointer outline-none",
              child.active && CX.dropdownLinkActive,
            )}
            onSelect={child.onClick}
          >
            {child.label}
            {child.badge ? <span className={CX.navBadge}>{child.badge}</span> : null}
          </DropdownItem>
        ),
      )}
    </Dropdown>
  );
}

function NavItem({ item }: { item: DocsHeaderNavItem }) {
  if (item.children?.length) {
    return <NavDropdown item={item} />;
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        className={cx(CX.navLink, item.active && CX.navLinkActive)}
        aria-current={item.active ? "page" : undefined}
        onClick={item.onClick}
      >
        <NavLinkContent item={item} />
      </a>
    );
  }

  return (
    <button
      type="button"
      className={cx(CX.navLink, item.active && CX.navLinkActive)}
      aria-current={item.active ? "page" : undefined}
      onClick={item.onClick}
    >
      <NavLinkContent item={item} />
    </button>
  );
}

export function DocsHeader({
  logo,
  brandLabel,
  brandMeta,
  navItems,
  search,
  actions,
  onMenuClick,
  className,
}: DocsHeaderProps) {
  return (
    <header className={cx(CX.root, className)}>
      <div className={CX.start}>
        {onMenuClick ? (
          <IconButton
            variant="tertiary"
            size="md"
            className={CX.menuButton}
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
        ) : null}
        <div className={CX.brand}>
          {logo ? <span className={CX.logo}>{logo}</span> : null}
          {brandLabel || brandMeta ? (
            <div className={CX.brandText}>
              {brandLabel ? <span className={CX.brandLabel}>{brandLabel}</span> : null}
              {brandMeta ? <span className={CX.brandMeta}>{brandMeta}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
      {search ? <div className={CX.search}>{search}</div> : null}
      <div className={CX.end}>
        {navItems && navItems.length > 0 ? (
          <nav className={CX.nav} aria-label="Site">
            <ul className={CX.navList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <NavItem item={item} />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {actions ? <div className={CX.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}
