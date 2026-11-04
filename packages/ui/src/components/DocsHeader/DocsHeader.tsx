"use client";
import { MenuIcon, ChevronDownIcon } from "../../icons";

import type { ReactNode } from "react";
import { Dropdown, DropdownItem } from "../Dropdown/Dropdown";
import dropdownStyles from "../Dropdown/Dropdown.module.css";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { cx } from "../../utils/cx";
import styles from "./DocsHeader.module.css";

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
      {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
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
          className={cx(styles.navLink, item.active && styles.navLinkActive)}
          aria-current={item.active ? "true" : undefined}
        >
          <NavLinkContent item={item} />
          <Icon size="sm" className={styles.navChevron}>
            <ChevronDownIcon />
          </Icon>
        </button>
      }
    >
      {children.map((child) =>
        child.href ? (
          <DropdownItem key={child.id} asChild className={dropdownStyles.item}>
            <a
              href={child.href}
              className={cx(styles.dropdownLink, child.active && styles.dropdownLinkActive)}
              aria-current={child.active ? "page" : undefined}
              onClick={child.onClick}
            >
              {child.label}
              {child.badge ? <span className={styles.navBadge}>{child.badge}</span> : null}
            </a>
          </DropdownItem>
        ) : (
          <DropdownItem
            key={child.id}
            className={cx(dropdownStyles.item, child.active && styles.dropdownLinkActive)}
            onSelect={child.onClick}
          >
            {child.label}
            {child.badge ? <span className={styles.navBadge}>{child.badge}</span> : null}
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
        className={cx(styles.navLink, item.active && styles.navLinkActive)}
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
      className={cx(styles.navLink, item.active && styles.navLinkActive)}
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
    <header className={cx(styles.root, className)}>
      <div className={styles.start}>
        {onMenuClick ? (
          <IconButton
            variant="tertiary"
            size="md"
            className={styles.menuButton}
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
        ) : null}
        <div className={styles.brand}>
          {logo ? <span className={styles.logo}>{logo}</span> : null}
          {brandLabel || brandMeta ? (
            <div className={styles.brandText}>
              {brandLabel ? <span className={styles.brandLabel}>{brandLabel}</span> : null}
              {brandMeta ? <span className={styles.brandMeta}>{brandMeta}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
      {search ? <div className={styles.search}>{search}</div> : null}
      <div className={styles.end}>
        {navItems && navItems.length > 0 ? (
          <nav className={styles.nav} aria-label="Site">
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <NavItem item={item} />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}
