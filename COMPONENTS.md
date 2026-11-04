# @coloxo/ui — Component API Reference

**Variants**, **sizes**, **colors**, **types**, and **props** for every public export of `@coloxo/ui`.

|         |                                                             |
| ------- | ----------------------------------------------------------- |
| Package | [`@coloxo/ui`](https://www.npmjs.com/package/@coloxo/ui)    |
| Styling | CSS Modules + `--cx-*` design tokens                        |
| Import  | `import { Button, Badge, ThemeProvider } from "@coloxo/ui"` |
| Docs    | [ui.coloxolabs.com](https://ui.coloxolabs.com)              |

Also see: [README.md](./README.md) · [packages/ui/README.md](./packages/ui/README.md)

Every named export is documented below and linked from the [Component index](#component-index). Type exports are listed under each component (for example `ButtonVariant`, `BadgeType`, `AlertType`).

---

## Brand & design tokens

**Coloxo brand blue:** `#2348FF` → primitive **`--cx-brand-600`**

Semantic aliases (light theme) map actions and text to brand, e.g. `--cx-color-primary`, `--cx-color-bg-brand-solid`, `--cx-color-fg-brand-primary`.

The `tokens` object (exported from the package) mirrors these CSS variables in JavaScript. It groups `color`, `typography`, `spacing`, `radius`, `shadow`, `size`, `motion`, and `zIndex`. Type exports: `Tokens` (the object shape) and `ColorToken` (a color key).

### Three token layers

| Layer             | Prefix / location                                                                | Purpose                                                 |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **1. Primitives** | `--cx-brand-*`, `--cx-neutral-*`, `--cx-red-*`, …                                | Color ramps (50–950), alpha, white/black                |
| **2. Semantic**   | `--cx-color-text-*`, `--cx-color-bg-*`, `--cx-color-border-*`, `--cx-color-fg-*` | Role-based UI colors (light/dark via `[data-cx-theme]`) |
| **3. Component**  | `--cx-control-height-*`, `--cx-radius-*`, component CSS modules                  | Control metrics and local styling                       |

Flat tokens (`--cx-color-fg`, `--cx-color-primary`, …) remain aliased at the bottom of `tokens.css`.

### Control heights

| Size | CSS variable             | Height         |
| ---- | ------------------------ | -------------- |
| `xs` | `--cx-control-height-xs` | 32px (2rem)    |
| `sm` | `--cx-control-height-sm` | 36px (2.25rem) |
| `md` | `--cx-control-height-md` | 40px (2.5rem)  |
| `lg` | `--cx-control-height-lg` | 44px (2.75rem) |
| `xl` | `--cx-control-height-xl` | 48px (3rem)    |

Shared interactive states: **default**, **hover**, **focus-visible**, **active**, **disabled**, **error** (where applicable), **loading** (where applicable).

---

## ThemeProvider

Wraps the app, applies the resolved theme to `<html>` and the `.cx-ui` root, and exposes theme state through `useTheme()`.

| Prop           | Type                                                         | Default   | Description                                                   |
| -------------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------- |
| `theme`        | `ThemeName` (`"light"` \| `"dark"` \| `"system"`)            | —         | Controlled theme preference                                   |
| `defaultTheme` | `ThemeName`                                                  | `"light"` | Initial theme when uncontrolled                               |
| `tokens`       | `ThemeTokenOverrides` (`{ color?: Record<string, string> }`) | —         | Override primitives (`brand600`) or semantic keys (`primary`) |
| `className`    | `string`                                                     | —         | Extra class on the `.cx-ui` root                              |
| `children`     | `ReactNode`                                                  | —         | App tree                                                      |

Sets `data-cx-theme` to the **resolved** `"light"` \| `"dark"`, `color-scheme`, and optional CSS variable overrides on the `.cx-ui` root. `system` follows `prefers-color-scheme`. When uncontrolled, the last choice persists to `localStorage` under `THEME_STORAGE_KEY` (`"cx-ui-theme"`).

`useTheme()` returns `ThemeContextValue`: `{ theme, resolvedTheme, setTheme }`. Type exports: `ThemeProviderProps`, `ThemeName`, `ThemeTokenOverrides`, `ThemeContextValue`.

```tsx
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

---

## Foundation

### Text

Foundational body-copy with semantic variants, locked size/line-height scale, color tones, and polymorphic rendering.

|              | Values                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| **`as`**     | `p` · `span` · `div` · `strong` · `em` · `label` · `li` · `figcaption`                                      |
| **Variants** | `body` · `caption` · `overline` · `code`                                                                    |
| **Sizes**    | `xs` (12/16) · `sm` (14/20) · `md` (16/24, default) · `lg` (18/28)                                          |
| **Weights**  | `regular` · `medium` · `semibold` · `bold`                                                                  |
| **Colors**   | `primary` · `secondary` · `tertiary` · `quaternary` · `brand` · `error` · `success` · `warning` · `inherit` |

| Prop      | Type          | Default | Description                                   |
| --------- | ------------- | ------- | --------------------------------------------- |
| `as`      | `TextElement` | `p`     | Rendered HTML element                         |
| `variant` | `TextVariant` | `body`  | Typographic function                          |
| `size`    | `TextSize`    | `md`    | Font-size / line-height step                  |
| `weight`  | `TextWeight`  | —       | Font-weight override                          |
| `color`   | `TextColor`   | —       | Semantic tone (variant defaults when omitted) |

Type exports: `TextProps`, `TextVariant`, `TextSize`, `TextWeight`, `TextColor`, `TextElement`.

```tsx
<Text>Standard UI prose for settings and modals.</Text>
<Text variant="caption">Updated 3 minutes ago</Text>
<Text variant="overline">Infrastructure workloads</Text>
<Text variant="code" as="span">8cf2b910…</Text>
```

### Heading

Semantic heading that decouples document outline (`level` → h1–h6) from visual scale (`size`).

|              | Values                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------- |
| **Levels**   | `1` · `2` · `3` · `4` · `5` · `6` (renders `h1`–`h6`)                                     |
| **Sizes**    | `sm` (16/24) · `md` (20/28) · `lg` (24/32) · `xl` (30/38) · `2xl` (36/44)                 |
| **Weight**   | `regular` · `medium` · `semibold` · `bold` (default: bold for xl/2xl, semibold otherwise) |
| **Tracking** | `normal` · `tight` · `tighter` (default: tighter for 2xl)                                 |

| Prop       | Type                     | Default                                                                         | Description          |
| ---------- | ------------------------ | ------------------------------------------------------------------------------- | -------------------- |
| `level`    | `HeadingLevel` (`1`–`6`) | `2`                                                                             | Heading tag          |
| `size`     | `HeadingSize`            | derived from `level` (`xl` for h1/h2, `lg` for h3, `md` for h4, `sm` for h5/h6) | Visual size          |
| `weight`   | `HeadingWeight`          | derived from size                                                               | Font weight override |
| `tracking` | `HeadingTracking`        | derived from size                                                               | Letter-spacing       |

Type exports: `HeadingProps`, `HeadingLevel`, `HeadingSize`, `HeadingWeight`, `HeadingTracking`.

```tsx
<Heading level={1} size="2xl" tracking="tighter">Dashboard</Heading>
<Heading level={3} size="sm">Compact widget title</Heading>
```

### Label

Accessible form label on Radix Label with required/optional markers, helper tooltip, disabled sync, and size scale aligned to control heights.

|           | Values                                                                   |
| --------- | ------------------------------------------------------------------------ |
| **Sizes** | `xs` (12/16) · `sm` (13/18) · `md` (14/20) · `lg` (15/22) · `xl` (16/24) |

| Prop                    | Type        | Default      | Description                            |
| ----------------------- | ----------- | ------------ | -------------------------------------- |
| `htmlFor`               | `string`    | —            | Associates with a control id           |
| `size`                  | `LabelSize` | `md`         | Typography scale                       |
| `required`              | `boolean`   | —            | Appends a red `*` (`aria-hidden`)      |
| `optional`              | `boolean`   | —            | Appends `(optional)` when not required |
| `disabled`              | `boolean`   | —            | Demotes contrast for disabled controls |
| `tooltip`               | `ReactNode` | —            | Inline helper tooltip (info icon)      |
| `tooltipSupportingText` | `ReactNode` | —            | Supporting line under tooltip title    |
| `children`              | `ReactNode` | **required** | Label text (may nest Badge, etc.)      |

Also accepts native `<label>` attributes. Type exports: `LabelProps`, `LabelSize`.

```tsx
<Label htmlFor="email" required tooltip="Used for SSO">Email Address</Label>
<Label htmlFor="org" optional>Organization Name</Label>
<Label htmlFor="prefix" disabled>Global Routing Prefix</Label>
```

### Icon

Sizing wrapper for SVG glyphs (Lucide, custom SVG, or other ReactNode). Marks itself `aria-hidden` by default.

|           | Values                           |
| --------- | -------------------------------- |
| **Sizes** | `xs` · `sm` · `md` · `lg` · `xl` |

| Prop       | Type        | Default      | Description |
| ---------- | ----------- | ------------ | ----------- |
| `size`     | `IconSize`  | `md`         | Box size    |
| `children` | `ReactNode` | **required** | The glyph   |

Type exports: `IconProps`, `IconSize`.

```tsx
<Icon size="lg">
  <Home />
</Icon>
```

### Divider

Structural separator (Radix Separator) with spacing tiers, decorative vs semantic modes, inset/subtle variants, and optional centered labels.

|                 | Values                                                |
| --------------- | ----------------------------------------------------- |
| **Orientation** | `horizontal` · `vertical`                             |
| **Spacing**     | `compact` (8px) · `default` (16px) · `relaxed` (32px) |

| Prop          | Type                         | Default      | Description                                                                   |
| ------------- | ---------------------------- | ------------ | ----------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` | Axis                                                                          |
| `spacing`     | `DividerSpacing`             | `default`    | Margin rhythm                                                                 |
| `decorative`  | `boolean`                    | `true`       | Presentational vs thematic break                                              |
| `label`       | `ReactNode`                  | —            | Centered label (horizontal only)                                              |
| `inset`       | `boolean`                    | —            | Inset from container edges                                                    |
| `subtle`      | `boolean`                    | —            | Lower-contrast stroke                                                         |
| `stretch`     | `boolean`                    | —            | Vertical only: stretch to flex cross-axis (default is 20px centered hairline) |

Type exports: `DividerProps`, `DividerSpacing`, `HorizontalDividerProps`, `VerticalDividerProps`.

```tsx
<Divider label="OR" />
<Divider orientation="vertical" />
<Divider orientation="vertical" stretch spacing="compact" />
<Divider decorative={false} spacing="relaxed" inset subtle />
```

---

## General

### Button

|                   | Values                                                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Variants**      | `primary` · `secondary` · `secondary-brand` · `tertiary` · `primary-destructive` · `secondary-destructive` · `tertiary-destructive` · `link-color` · `link-gray` |
| **Sizes**         | `xs` · `sm` · `md` · `lg` · **`xl`**                                                                                                                             |
| **Icon position** | `left` · `right`                                                                                                                                                 |

| Prop           | Type                              | Default   | Description                      |
| -------------- | --------------------------------- | --------- | -------------------------------- |
| `variant`      | `ButtonVariant`                   | `primary` | Visual style                     |
| `size`         | `ButtonSize`                      | `md`      | Control height                   |
| `loading`      | `boolean`                         | `false`   | Spinner + disabled + `aria-busy` |
| `fullWidth`    | `boolean`                         | `false`   | 100% width                       |
| `icon`         | `ReactNode`                       | —         | Icon slot                        |
| `iconPosition` | `ButtonIconPosition`              | `left`    | Icon side                        |
| `type`         | `"button" \| "submit" \| "reset"` | `button`  | Native button type               |

Accepts all native `<button>` attributes. Type exports: `ButtonProps`, `ButtonVariant`, `ButtonSize`, `ButtonIconPosition`.

```tsx
<Button variant="secondary-brand" size="lg" icon={<Plus />}>
  New project
</Button>
```

### IconButton

Square or circular icon-only button. Requires an accessible name.

|              | Values                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Variants** | `primary` · `secondary` · `secondary-brand` · `tertiary` · `primary-destructive` · `secondary-destructive` · `tertiary-destructive` |
| **Sizes**    | `xs` · `sm` · `md` · `lg` · `xl`                                                                                                    |
| **Shapes**   | `square` · `circle`                                                                                                                 |

| Prop         | Type                | Default      | Description                   |
| ------------ | ------------------- | ------------ | ----------------------------- |
| `aria-label` | `string`            | **required** | Accessible name               |
| `variant`    | `IconButtonVariant` | `tertiary`   | Visual style                  |
| `size`       | `IconButtonSize`    | `md`         | Square size                   |
| `shape`      | `IconButtonShape`   | `square`     | Corner radius                 |
| `loading`    | `boolean`           | `false`      | Spinner + disabled            |
| `tooltip`    | `string`            | —            | Radix tooltip (supplementary) |
| `children`   | `ReactNode`         | **required** | Icon glyph                    |

Type exports: `IconButtonProps`, `IconButtonVariant`, `IconButtonSize`, `IconButtonShape`.

```tsx
<IconButton aria-label="Settings" variant="secondary" shape="circle">
  <Settings />
</IconButton>
```

### Badge

Status/label pill with a `type` × `color` matrix.

|            | Values                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| **Types**  | `pill-color` · `badge-color` · `badge-modern`                                                         |
| **Colors** | `brand` · `gray` · `error` · `warning` · `success` · `blue` · `indigo` · `purple` · `pink` · `orange` |
| **Sizes**  | `sm` · `md` · `lg`                                                                                    |

| Prop        | Type         | Default      | Description                               |
| ----------- | ------------ | ------------ | ----------------------------------------- |
| `type`      | `BadgeType`  | `pill-color` | Shape / style family                      |
| `color`     | `BadgeColor` | `brand`      | Tone (ignored for `badge-modern` surface) |
| `size`      | `BadgeSize`  | `md`         | Size                                      |
| `dot`       | `boolean`    | —            | Leading status dot                        |
| `avatarSrc` | `string`     | —            | Leading avatar image                      |
| `onClose`   | `() => void` | —            | Renders a dismiss control                 |
| `children`  | `ReactNode`  | **required** | Label                                     |

Type exports: `BadgeProps`, `BadgeType`, `BadgeSize`, `BadgeColor`.

```tsx
<Badge type="badge-color" color="success" size="sm" dot>
  Active
</Badge>
```

### Tag

Neutral chip for filters and metadata (not semantic color ramps).

|           | Values             |
| --------- | ------------------ |
| **Sizes** | `sm` · `md` · `lg` |

| Prop        | Type               | Default      | Description              |
| ----------- | ------------------ | ------------ | ------------------------ |
| `size`      | `TagSize`          | `md`         | Size                     |
| `dot`       | `boolean`          | —            | Leading dot              |
| `avatarSrc` | `string`           | —            | Leading avatar           |
| `count`     | `number \| string` | —            | Trailing count           |
| `onClose`   | `() => void`       | —            | Renders a remove control |
| `children`  | `ReactNode`        | **required** | Label                    |

Type exports: `TagProps`, `TagSize`.

```tsx
<Tag size="sm" count={3} onClose={() => remove()}>
  Filter
</Tag>
```

### FeaturedIcon

Icon inside a styled container (alerts, notifications, empty states).

|            | Values                                                                |
| ---------- | --------------------------------------------------------------------- |
| **Types**  | `light-circle` · `dark-circle` · `modern` · `modern-neue` · `outline` |
| **Colors** | `brand` · `gray` · `error` · `warning` · `success`                    |
| **Sizes**  | `sm` · `md` · `lg` · `xl`                                             |

| Prop       | Type                | Default        | Description                  |
| ---------- | ------------------- | -------------- | ---------------------------- |
| `type`     | `FeaturedIconType`  | `light-circle` | Container style              |
| `color`    | `FeaturedIconColor` | `brand`        | Tone                         |
| `size`     | `FeaturedIconSize`  | `md`           | Box size                     |
| `children` | `ReactNode`         | **required**   | Icon (SVG / Lucide / custom) |

Type exports: `FeaturedIconProps`, `FeaturedIconType`, `FeaturedIconColor`, `FeaturedIconSize`.

```tsx
<FeaturedIcon type="modern" color="success" size="lg">
  <Check />
</FeaturedIcon>
```

### ButtonGroup

Visually merges adjacent `Button` / `IconButton` nodes (shared borders, single radius on the ends). Renders `role="group"`.

| Prop       | Type        | Description           |
| ---------- | ----------- | --------------------- |
| `children` | `ReactNode` | Adjacent button nodes |

Accepts native `<div>` attributes. Type export: `ButtonGroupProps`.

```tsx
<ButtonGroup>
  <Button variant="secondary">Day</Button>
  <Button variant="secondary">Week</Button>
  <Button variant="secondary">Month</Button>
</ButtonGroup>
```

### Avatar

Image, initials, or placeholder avatar with presence, verification, count, or company badge.

|            | Values                                   |
| ---------- | ---------------------------------------- |
| **Sizes**  | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` |
| **Status** | `online` · `offline` · `busy` · `away`   |

| Prop              | Type                                   | Default   | Description                              |
| ----------------- | -------------------------------------- | --------- | ---------------------------------------- |
| `src`             | `string \| null`                       | —         | Image URL                                |
| `alt`             | `string`                               | `""`      | Image alt text                           |
| `initials`        | `string`                               | —         | Reduced to 2 letters                     |
| `placeholder`     | `ReactNode`                            | user icon | Custom empty node                        |
| `placeholderIcon` | `ReactNode \| ComponentType<SVGProps>` | —         | Icon-based placeholder                   |
| `size`            | `AvatarSize`                           | `md`      | Diameter                                 |
| `status`          | `AvatarStatus`                         | —         | Presence dot                             |
| `verified`        | `boolean`                              | —         | Verified check badge                     |
| `border`          | `boolean`                              | `false`   | Outer padded border                      |
| `contrastBorder`  | `boolean`                              | `true`    | Inner contrast ring                      |
| `rounded`         | `boolean`                              | `true`    | Circle when true, soft square when false |
| `badge`           | `ReactNode`                            | —         | Company/custom badge (bottom-right)      |
| `count`           | `number`                               | —         | Count pill (`99+` cap)                   |
| `focusable`       | `boolean`                              | `false`   | Focus ring when parent group is focused  |
| `imgProps`        | `ImgHTMLAttributes`                    | —         | Extra `<img>` props                      |

`badge`, `status`, `verified`, and `count` are mutually exclusive (resolved in that priority order). Type exports: `AvatarProps`, `AvatarSize`, `AvatarStatus`.

```tsx
<Avatar src="/u/ada.jpg" alt="Ada Lovelace" size="lg" status="online" />
```

### AvatarLabelGroup

Avatar paired with a title and optional subtitle.

|           | Values             |
| --------- | ------------------ |
| **Sizes** | `sm` · `md` · `lg` |

| Prop              | Type                   | Default      | Description              |
| ----------------- | ---------------------- | ------------ | ------------------------ |
| `title`           | `ReactNode`            | **required** | Primary line             |
| `subtitle`        | `ReactNode`            | —            | Secondary line           |
| `size`            | `AvatarLabelGroupSize` | `md`         | Avatar + text scale      |
| `border`          | `boolean`              | `true`       | Passes through to Avatar |
| `avatarClassName` | `string`               | —            | Class on the avatar      |

Also accepts `Avatar` props (except `size`). Type exports: `AvatarLabelGroupProps`, `AvatarLabelGroupSize`.

```tsx
<AvatarLabelGroup src="/u/ada.jpg" title="Ada Lovelace" subtitle="ada@coloxo.dev" />
```

### AvatarProfilePhoto

Larger framed profile photo with presence/verification/company badge.

|           | Values             |
| --------- | ------------------ |
| **Sizes** | `sm` · `md` · `lg` |

| Prop          | Type                     | Default   | Description          |
| ------------- | ------------------------ | --------- | -------------------- |
| `src`         | `string \| null`         | —         | Image URL            |
| `alt`         | `string`                 | `""`      | Alt text             |
| `initials`    | `string`                 | —         | Fallback initials    |
| `placeholder` | `ReactNode`              | user icon | Custom empty node    |
| `size`        | `AvatarProfilePhotoSize` | `md`      | Frame size           |
| `status`      | `AvatarStatus`           | —         | Presence dot         |
| `verified`    | `boolean`                | —         | Verified badge       |
| `badge`       | `ReactNode`              | —         | Company/custom badge |

`verified`, `badge`, and `status` are mutually exclusive (`verified` → `badge` → `status`). Prefer `AvatarCompanyIcon` for company logos.

Type exports: `AvatarProfilePhotoProps`, `AvatarProfilePhotoSize`.

```tsx
<AvatarProfilePhoto src="/u/ada.jpg" alt="Ada" size="lg" verified />
```

### AvatarCompanyIcon

Small company logo image sized to Avatar's badge slot.

|           | Values                                                  |
| --------- | ------------------------------------------------------- |
| **Sizes** | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` (`AvatarSize`) |

| Prop   | Type         | Default      | Description |
| ------ | ------------ | ------------ | ----------- |
| `src`  | `string`     | **required** | Logo URL    |
| `size` | `AvatarSize` | `md`         | Badge size  |
| `alt`  | `string`     | `""`         | Alt text    |

Accepts native `<img>` attributes. Type export: `AvatarCompanyIconProps`.

```tsx
<Avatar src="/u/ada.jpg" badge={<AvatarCompanyIcon src="/logos/acme.svg" size="md" />} />
```

### AvatarGroup

Stacked avatars with an overflow pill.

| Prop            | Type                | Default      | Description                       |
| --------------- | ------------------- | ------------ | --------------------------------- |
| `items`         | `AvatarGroupItem[]` | **required** | `{ src?, alt?, initials?, key? }` |
| `max`           | `number`            | `5`          | Visible avatars before overflow   |
| `size`          | `AvatarSize`        | `md`         | Avatar diameter                   |
| `border`        | `boolean`           | `false`      | Outer ring on each avatar         |
| `overflowLabel` | `ReactNode`         | `+N`         | Overflow pill content             |

Type exports: `AvatarGroupProps`, `AvatarGroupItem`.

```tsx
<AvatarGroup
  max={3}
  items={[{ src: "/1.jpg" }, { initials: "AL" }, { src: "/3.jpg" }, { initials: "MK" }]}
/>
```

### Card

Surface container with 21 visual variants and a composable subcomponent API. `CardVariant` values:

`outline` · `default` · `bordered` · `elevated` · `flat` · `filled` · `neumorphic` · `material` · `clay` · `brutalist` · `glassGradient` · `bento` · `inset` · `gradient` · `carbon` · `aurora` · `skeuomorphic` · `paper` · `ghost` · `holographic` · `retro`

`CardPadding`: `none` · `sm` · `md` · `lg`.

| Prop          | Type          | Default   | Description                                  |
| ------------- | ------------- | --------- | -------------------------------------------- |
| `variant`     | `CardVariant` | `outline` | Visual surface style                         |
| `padding`     | `CardPadding` | `md`      | Body padding for the simple title/footer API |
| `title`       | `ReactNode`   | —         | Simple-layout title                          |
| `description` | `ReactNode`   | —         | Simple-layout description                    |
| `header`      | `ReactNode`   | —         | Custom header (overrides title/description)  |
| `footer`      | `ReactNode`   | —         | Footer slot                                  |
| `children`    | `ReactNode`   | —         | Body content                                 |

Accepts native `<div>` attributes. The simple layout activates when any of `header`, `title`, `description`, or `footer` is set; otherwise `children` render raw.

`Card` also exposes subcomponents as `Card.Header`, `Card.Content`, `Card.Media`, `Card.Actions`, and `Card.ActionArea` (also exported as standalone `CardHeader`, `CardContent`, `CardMedia`, `CardActions`, `CardActionArea`).

#### CARD_VARIANTS

`CARD_VARIANTS` is a readonly catalog for docs and playgrounds. Each entry is `{ value, label, description, bestFor, category }`, where `category` is one of `surface` · `effect` · `layout` · `visual`:

| Category  | Variants                                                                         |
| --------- | -------------------------------------------------------------------------------- |
| `surface` | `default`, `elevated`, `outline`, `filled`, `inset`, `ghost`, `flat`, `bordered` |
| `effect`  | `neumorphic`, `clay`, `aurora`, `holographic`, `glassGradient`                   |
| `layout`  | `bento`                                                                          |
| `visual`  | `material`, `brutalist`, `paper`, `skeuomorphic`, `retro`, `gradient`, `carbon`  |

#### CardHeader

| Prop                | Type        | Default | Description                                    |
| ------------------- | ----------- | ------- | ---------------------------------------------- |
| `title`             | `ReactNode` | —       | Title text                                     |
| `subheader`         | `ReactNode` | —       | Supporting text                                |
| `avatar`            | `ReactNode` | —       | Leading avatar slot                            |
| `action`            | `ReactNode` | —       | Trailing action slot                           |
| `disableTypography` | `boolean`   | —       | Render title/subheader without default styling |

#### CardContent

| Prop        | Type          | Default | Description  |
| ----------- | ------------- | ------- | ------------ |
| `padding`   | `CardPadding` | `md`    | Padding      |
| `component` | `ElementType` | `div`   | Root element |

#### CardMedia

| Prop        | Type               | Default | Description                                                        |
| ----------- | ------------------ | ------- | ------------------------------------------------------------------ |
| `image`     | `string`           | —       | Background-image URL (for `div` surface)                           |
| `src`       | `string`           | —       | Media `src` for `img`/`video`/etc.                                 |
| `component` | `ElementType`      | `div`   | Root element (`div`, `img`, `video`, `audio`, `picture`, `iframe`) |
| `height`    | `number \| string` | —       | Height (number → px); required for background media                |
| `alt`       | `string`           | —       | Alt text                                                           |
| `title`     | `string`           | —       | Title attribute                                                    |

#### CardActions

| Prop             | Type      | Default | Description                   |
| ---------------- | --------- | ------- | ----------------------------- |
| `disableSpacing` | `boolean` | `false` | Remove default action spacing |

#### CardActionArea

| Prop        | Type          | Default                       | Description                                    |
| ----------- | ------------- | ----------------------------- | ---------------------------------------------- |
| `href`      | `string`      | —                             | Renders an `<a>` when set                      |
| `component` | `ElementType` | `button` (or `a` with `href`) | Root element                                   |
| `active`    | `boolean`     | —                             | Forces `data-active` (else derived from press) |

Accepts native button attributes (including `disabled`, `type`).

Type exports: `CardProps`, `CardVariant`, `CardPadding`, `CardHeaderProps`, `CardContentProps`, `CardMediaProps`, `CardActionsProps`, `CardActionAreaProps`.

```tsx
<Card variant="elevated">
  <Card.Media component="img" src="/cover.jpg" height={160} alt="Cover" />
  <Card.Header title="Monthly report" subheader="September" />
  <Card.Content>Revenue grew 12% month over month.</Card.Content>
  <Card.Actions>
    <Button variant="tertiary" size="sm">
      Dismiss
    </Button>
    <Button size="sm">View</Button>
  </Card.Actions>
</Card>
```

### Statistic

KPI block with value, optional trend badge, and icon.

|           | Values                                       |
| --------- | -------------------------------------------- |
| **Trend** | `up` · `down` · `neutral` (`StatisticTrend`) |
| **Size**  | `sm` · `md` (`StatisticSize`)                |

| Prop             | Type             | Default                                         | Description                        |
| ---------------- | ---------------- | ----------------------------------------------- | ---------------------------------- |
| `label`          | `ReactNode`      | **required**                                    | Metric label                       |
| `value`          | `ReactNode`      | **required**                                    | Metric value                       |
| `prefix`         | `ReactNode`      | —                                               | Value prefix (e.g. `$`)            |
| `suffix`         | `ReactNode`      | —                                               | Value suffix (e.g. `%`)            |
| `trend`          | `ReactNode`      | —                                               | Trend text inside a `Badge`        |
| `trendDirection` | `StatisticTrend` | inferred from `trend` (`-` → `down`, else `up`) | Trend color/arrow                  |
| `description`    | `ReactNode`      | —                                               | Supporting text                    |
| `icon`           | `ReactNode`      | —                                               | Plain icon slot                    |
| `featuredIcon`   | `ReactNode`      | —                                               | Rendered inside a `FeaturedIcon`   |
| `size`           | `StatisticSize`  | `md`                                            | `sm` densifies dashboard KPI tiles |

Type exports: `StatisticProps`, `StatisticSize`, `StatisticTrend`.

```tsx
<Statistic
  label="Revenue"
  value="48,120"
  prefix="$"
  trend="+12%"
  trendDirection="up"
  size="sm"
  featuredIcon={<DollarSign />}
/>
```

---

## Forms

All labeled inputs wrap their control in `FormField`, sharing `label`, `required`, `optional`, `description` (alias `hint`), and `error` handling with linked `aria-describedby`.

### Input

Untitled-aligned text field. Sizes `sm` (36px), `md` (40px), `lg` (44px); focus ring uses Coloxo blue (`--cx-color-border-brand`).

|           | Values                           |
| --------- | -------------------------------- |
| **Sizes** | `sm` · `md` · `lg` (`InputSize`) |

| Prop                                                   | Type                                   | Default | Description                          |
| ------------------------------------------------------ | -------------------------------------- | ------- | ------------------------------------ |
| `label`                                                | `ReactNode`                            | —       | Field label                          |
| `required` / `optional`                                | `boolean`                              | —       | Label markers                        |
| `description`                                          | `ReactNode`                            | —       | Helper text below                    |
| `hint`                                                 | `ReactNode`                            | —       | Alias for `description`              |
| `error`                                                | `ReactNode`                            | —       | Message + trailing error icon        |
| `size`                                                 | `InputSize`                            | `md`    | Control height                       |
| `icon`                                                 | `ReactNode \| ComponentType<SVGProps>` | —       | Leading icon                         |
| `suffix`                                               | `ReactNode`                            | —       | Trailing custom node                 |
| `tooltip`                                              | `string`                               | —       | Help icon with tooltip               |
| `shortcut`                                             | `string \| boolean`                    | —       | Keyboard badge (`true` → ⌘K)         |
| `leadingText`                                          | `string`                               | —       | Inline prefix text (e.g. `https://`) |
| `type`                                                 | `string`                               | `text`  | `password` adds a show/hide toggle   |
| `groupFlat` / `groupFlatLeading` / `groupFlatTrailing` | `boolean`                              | —       | Internal flags set by `InputGroup`   |

Extends native `<input>` attributes (except `size`, `prefix`). Type exports: `InputProps`, `InputSize`, `InputGroupProps`.

```tsx
<Input label="Email" type="email" icon={<Mail />} description="We'll never share it." />
```

### InputGroup

Joins an input with leading/trailing addons (dropdowns, buttons, prefixes). Clones the child input with shared size and flat edges.

| Prop                                                                 | Type        | Default      | Description                   |
| -------------------------------------------------------------------- | ----------- | ------------ | ----------------------------- |
| `label` / `required` / `optional` / `description` / `hint` / `error` | —           | —            | Same field chrome as `Input`  |
| `size`                                                               | `InputSize` | `md`         | Shared control height         |
| `leadingText`                                                        | `string`    | —            | Inline leading text           |
| `leadingAddon`                                                       | `ReactNode` | —            | Joined addon before the input |
| `trailingAddon`                                                      | `ReactNode` | —            | Joined addon after the input  |
| `children`                                                           | `ReactNode` | **required** | The `Input` element           |

### InputPrefix

Chip for leading/trailing addon chrome (joined selects/buttons). Also available as `InputGroup.Prefix`.

| Prop       | Type                      | Default   | Description         |
| ---------- | ------------------------- | --------- | ------------------- |
| `position` | `"leading" \| "trailing"` | `leading` | Which edge to shape |
| `disabled` | `boolean`                 | —         | Muted styling       |

```tsx
<InputGroup leadingAddon={<InputPrefix>https://</InputPrefix>}>
  <Input placeholder="yourdomain" />
</InputGroup>
```

### Textarea

Multi-line field with resize control and optional character count.

|            | Values                                                         |
| ---------- | -------------------------------------------------------------- |
| **Resize** | `none` · `vertical` · `horizontal` · `both` (`TextareaResize`) |

| Prop                                                                 | Type             | Default    | Description                                 |
| -------------------------------------------------------------------- | ---------------- | ---------- | ------------------------------------------- |
| `label` / `required` / `optional` / `description` / `hint` / `error` | —                | —          | Field chrome                                |
| `resize`                                                             | `TextareaResize` | `vertical` | Resize handle behavior                      |
| `showCount`                                                          | `boolean`        | —          | Shows `current/max` when `maxLength` is set |
| `rows`                                                               | `number`         | `4`        | Visible rows                                |

Extends native `<textarea>` attributes. Type exports: `TextareaProps`, `TextareaResize`.

```tsx
<Textarea label="Notes" maxLength={280} showCount rows={5} />
```

### Select

Single-select with optional search (Radix Select, or Popover listbox when `searchable`).

|           | Values                            |
| --------- | --------------------------------- |
| **Sizes** | `sm` · `md` · `lg` (`SelectSize`) |

| Prop                                                        | Type                      | Default      | Description                     |
| ----------------------------------------------------------- | ------------------------- | ------------ | ------------------------------- |
| `options`                                                   | `SelectOption[]`          | **required** | `{ value, label, disabled? }`   |
| `value` / `defaultValue`                                    | `string`                  | —            | Controlled / uncontrolled value |
| `onValueChange` / `onChange`                                | `(value: string) => void` | —            | Change handlers                 |
| `placeholder`                                               | `string`                  | `Select…`    | Empty text                      |
| `size`                                                      | `SelectSize`              | `md`         | Control height                  |
| `clearable`                                                 | `boolean`                 | —            | Shows a clear control           |
| `searchable`                                                | `boolean`                 | —            | Enables the searchable listbox  |
| `label` / `required` / `optional` / `description` / `error` | —                         | —            | Field chrome                    |
| `name` / `id` / `disabled` / `className`                    | —                         | —            | Passthrough                     |

Type exports: `SelectProps`, `SelectOption`, `SelectSize`.

```tsx
<Select
  label="Country"
  searchable
  clearable
  options={[
    { value: "us", label: "United States" },
    { value: "in", label: "India" },
  ]}
/>
```

### Combobox

Filterable single-select with a text input. See `ComboboxOption` for the option
shape and `ComboboxSize` for the size union.

| Prop                                                             | Type                              | Default      | Description                                      |
| ---------------------------------------------------------------- | --------------------------------- | ------------ | ------------------------------------------------ |
| `options`                                                        | `ComboboxOption[]`                | **required** | Selectable items                                 |
| `label`                                                          | `ReactNode`                       | —            | Field label                                      |
| `description`                                                    | `ReactNode`                       | —            | Supporting text                                  |
| `error`                                                          | `ReactNode`                       | —            | Error message and invalid styling                |
| `placeholder`                                                    | `string`                          | —            | Empty-input text                                 |
| `value`                                                          | `string \| null`                  | —            | Controlled value                                 |
| `defaultValue`                                                   | `string`                          | —            | Initial value when uncontrolled                  |
| `onValueChange`                                                  | `(value: string \| null) => void` | —            | Selection handler                                |
| `disabled`                                                       | `boolean`                         | —            | Disable the field                                |
| `required`                                                       | `boolean`                         | —            | Mark as required                                 |
| `clearable`                                                      | `boolean`                         | —            | Show a clear control                             |
| `size`                                                           | `ComboboxSize`                    | —            | Control height                                   |
| `name`                                                           | `string`                          | —            | Form field name                                  |
| `id`                                                             | `string`                          | —            | Input id                                         |
| `emptyMessage`                                                   | `string`                          | —            | Shown when no option matches                     |
| `className`                                                      | `string`                          | —            | Extra class                                      |
| `aria-label`                                                     | `string`                          | —            | Accessible name when there is no visible `label` |
| Type exports: `ComboboxProps`, `ComboboxOption`, `ComboboxSize`. |

```tsx
<Combobox label="Runtime" options={OPTIONS} placeholder="Select a runtime…" clearable />
```

---

### InputOTP

One-time-code field. A single accessible input sits behind visual slots, so the
value is a real input with a real caret rather than a row of separate fields.
Built on `input-otp`.

|                                                                                   | Values                       |
| --------------------------------------------------------------------------------- | ---------------------------- |
| **Sizes**                                                                         | `sm` · `md` (default) · `lg` |
| `InputOTP` accepts all `OTPInput` props from `input-otp`, with `size` narrowed to |
| the three-step union. The ones worth knowing:                                     |
| Prop                                                                              | Type                         | Default              | Description                    |
| ---                                                                               | ---                          | ---                  | ---                            |
| `maxLength`                                                                       | `number`                     | —                    | Number of slots                |
| `value`                                                                           | `string`                     | —                    | Controlled code                |
| `defaultValue`                                                                    | `string`                     | —                    | Initial code when uncontrolled |
| `onChange`                                                                        | `(value: string) => void`    | —                    | Fired on every edit            |
| `pattern`                                                                         | `string \| RegExp`           | `REGEXP_ONLY_DIGITS` | Allowed characters             |
| `size`                                                                            | `"sm" \| "md" \| "lg"`       | `md`                 | Slot scale                     |
| `containerClassName`                                                              | `string`                     | —                    | Class on the outer container   |
| `className`                                                                       | `string`                     | —                    | Class on the hidden input      |
| Companion parts:                                                                  |

- `InputOTPGroup` — groups adjacent slots (`div` props).
- `InputOTPSlot` — one visual slot; requires `index`. Must be rendered inside `InputOTP`.
- `InputOTPSeparator` — divider between groups.
  Character patterns exported from the package: `REGEXP_ONLY_DIGITS`,
  `REGEXP_ONLY_CHARS`, `REGEXP_ONLY_DIGITS_AND_CHARS`.
  Type exports: `InputOTPProps`, `InputOTPGroupProps`, `InputOTPSlotProps`, `InputOTPSeparatorProps`.

```tsx
<InputOTP maxLength={6} onChange={setCode}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

---

### ColorPicker

Untitled UI–style solid color pickers (React Aria + Radix Popover): spectrum, minimal, swatches, brand/gray presets, palette grid, format switching, eye dropper, and standalone hue/alpha sliders. For gradients use the separate `GradientPicker` component.

|              | Values                                                                                 |
| ------------ | -------------------------------------------------------------------------------------- |
| **Variants** | `solid` · `minimal` · `swatches` · `brand` · `gray` · `palette` (`ColorPickerVariant`) |
| **Sizes**    | `sm` · `md` · `lg` (`ColorPickerSize`)                                                 |
| **Formats**  | `hex` · `rgb` · `hsl` · `hsb` (`ColorFormat`)                                          |

| Prop                              | Type                                  | Default   | Description                  |
| --------------------------------- | ------------------------------------- | --------- | ---------------------------- |
| `value` / `defaultValue`          | `string`                              | `#2348ff` | CSS / hex color              |
| `onChange`                        | `(hex: string, color: Color) => void` | —         | Change handler               |
| `variant`                         | `ColorPickerVariant`                  | `solid`   | Panel layout                 |
| `size`                            | `ColorPickerSize`                     | `md`      | Trigger height               |
| `swatches`                        | `readonly string[]`                   | presets   | Custom swatch list           |
| `swatchSize`                      | `"sm" \| "md"`                        | `md`      | Swatch cell size             |
| `showAlpha`                       | `boolean`                             | `true`    | Transparency slider          |
| `showEyeDropper`                  | `boolean`                             | `true`    | EyeDropper button (Chromium) |
| `format` / `defaultFormat`        | `ColorFormat`                         | `hex`     | Value input model            |
| `inline`                          | `boolean`                             | `false`   | Panel without popover        |
| `hideTrigger`                     | `boolean`                             | `false`   | Panel only (with `inline`)   |
| `label` / `description` / `error` | `ReactNode`                           | —         | FormField chrome             |

### GradientPicker

Dedicated multi-stop gradient editor (linear / radial) — separate from `ColorPicker`. Drag stops on the track, edit the active stop with spectrum controls, add/remove stops, and read the CSS via `gradientToCss`.

| Prop                     | Type                                          | Default            | Description        |
| ------------------------ | --------------------------------------------- | ------------------ | ------------------ |
| `value` / `defaultValue` | `GradientValue`                               | `DEFAULT_GRADIENT` | Stops + angle/type |
| `onChange`               | `(value: GradientValue, css: string) => void` | —                  | Change handler     |

Also exports: `ColorHueSlider`, `ColorAlphaSlider`, `GradientPanel`, `BRAND_SWATCHES`, `GRAY_SWATCHES`, `DEFAULT_SWATCHES`, `COLOR_PALETTE`, `DEFAULT_GRADIENT`, `gradientToCss`.

Type exports: `ColorPickerProps`, `ColorPickerVariant`, `ColorPickerSize`, `ColorFormat`, `GradientPickerProps`, `GradientValue`, `GradientStop`, `GradientType`.

```tsx
<ColorPicker label="Brand color" defaultValue="#2348ff" />
<GradientPicker label="Hero wash" onChange={(g, css) => setCss(css)} />
<ColorHueSlider defaultValue="#2348ff" />
```

### Checkbox

Single checkbox with label, description, indeterminate, and error states (Radix Checkbox).

| Prop                                              | Type                         | Default | Description                  |
| ------------------------------------------------- | ---------------------------- | ------- | ---------------------------- |
| `label`                                           | `ReactNode`                  | —       | Inline label                 |
| `description`                                     | `ReactNode`                  | —       | Helper text                  |
| `checked` / `defaultChecked`                      | `boolean`                    | —       | Controlled / uncontrolled    |
| `onCheckedChange`                                 | `(checked: boolean) => void` | —       | Change handler               |
| `indeterminate`                                   | `boolean`                    | —       | Mixed state                  |
| `error`                                           | `ReactNode`                  | —       | Error message (role `alert`) |
| `disabled` / `required` / `name` / `value` / `id` | —                            | —       | Passthrough                  |
| `aria-label`                                      | `string`                     | —       | Name when no visible label   |

Type export: `CheckboxProps`.

```tsx
<Checkbox label="I agree to the terms" required />
```

### Radio & RadioGroup

`RadioGroup` manages a set of options; `Radio` is a single item (Radix Radio Group).

**RadioGroup**

|                 | Values                    |
| --------------- | ------------------------- |
| **Orientation** | `vertical` · `horizontal` |

| Prop                                    | Type                         | Default    | Description                                   |
| --------------------------------------- | ---------------------------- | ---------- | --------------------------------------------- |
| `options`                               | `RadioOption[]`              | —          | `{ value, label, description?, disabled? }`   |
| `value` / `defaultValue`                | `string`                     | —          | Controlled / uncontrolled                     |
| `onValueChange`                         | `(value: string) => void`    | —          | Change handler                                |
| `label` / `description` / `error`       | `ReactNode`                  | —          | Group chrome                                  |
| `orientation`                           | `"vertical" \| "horizontal"` | `vertical` | Layout                                        |
| `required` / `disabled` / `name` / `id` | —                            | —          | Passthrough                                   |
| `children`                              | `ReactNode`                  | —          | Custom `Radio` items (when `options` omitted) |

**Radio**

| Prop                    | Type        | Default      | Description      |
| ----------------------- | ----------- | ------------ | ---------------- |
| `value`                 | `string`    | **required** | Option value     |
| `label` / `description` | `ReactNode` | —            | Item copy        |
| `disabled`              | `boolean`   | —            | Disable the item |

Type exports: `RadioProps`, `RadioGroupProps`, `RadioOption`.

```tsx
<RadioGroup
  label="Plan"
  defaultValue="pro"
  options={[
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro", description: "Best for teams" },
  ]}
/>
```

### Switch

Toggle switch with label and description (Radix Switch).

| Prop                                    | Type                         | Default | Description               |
| --------------------------------------- | ---------------------------- | ------- | ------------------------- |
| `label` / `description`                 | `ReactNode`                  | —       | Copy                      |
| `checked` / `defaultChecked`            | `boolean`                    | —       | Controlled / uncontrolled |
| `onCheckedChange`                       | `(checked: boolean) => void` | —       | Change handler            |
| `disabled` / `required` / `name` / `id` | —                            | —       | Passthrough               |

Type export: `SwitchProps`.

```tsx
<Switch label="Email notifications" defaultChecked />
```

### Toggle

Two-state pressable button (Radix Toggle).

|              | Values                                  |
| ------------ | --------------------------------------- |
| **Sizes**    | `sm` · `md` · `lg` (`ToggleSize`)       |
| **Variants** | `default` · `outline` (`ToggleVariant`) |

| Prop                         | Type                         | Default   | Description                               |
| ---------------------------- | ---------------------------- | --------- | ----------------------------------------- |
| `pressed` / `defaultPressed` | `boolean`                    | —         | Controlled / uncontrolled state           |
| `onPressedChange`            | `(pressed: boolean) => void` | —         | Change handler                            |
| `size`                       | `ToggleSize`                 | `md`      | Size                                      |
| `variant`                    | `ToggleVariant`              | `default` | Fill vs. outline                          |
| `icon`                       | `ReactNode`                  | —         | Leading icon (icon-only when no children) |
| `children`                   | `ReactNode`                  | —         | Label                                     |

Extends native `<button>` attributes (except `children` override). Type exports: `ToggleProps`, `ToggleSize`, `ToggleVariant`.

### ToggleGroup & ToggleGroupItem

Grouped toggles in single or multiple selection mode (Radix Toggle Group). Size is shared through context.

|                 | Values                              |
| --------------- | ----------------------------------- |
| **Type**        | `single` (default) · `multiple`     |
| **Orientation** | `horizontal` (default) · `vertical` |

**ToggleGroup** (shared)

| Prop                     | Type                                                    | Default      | Description                     |
| ------------------------ | ------------------------------------------------------- | ------------ | ------------------------------- |
| `type`                   | `"single" \| "multiple"`                                | `single`     | Selection mode                  |
| `value` / `defaultValue` | `string` (single) / `string[]` (multiple)               | —            | Selection                       |
| `onValueChange`          | `(value: string) => void` / `(value: string[]) => void` | —            | Change handler (typed per mode) |
| `size`                   | `ToggleSize`                                            | `md`         | Item size                       |
| `orientation`            | `"horizontal" \| "vertical"`                            | `horizontal` | Layout                          |
| `disabled`               | `boolean`                                               | —            | Disable all items               |
| `aria-label`             | `string`                                                | —            | Group name                      |

**ToggleGroupItem**

| Prop         | Type        | Default      | Description                               |
| ------------ | ----------- | ------------ | ----------------------------------------- |
| `value`      | `string`    | **required** | Item value                                |
| `icon`       | `ReactNode` | —            | Leading icon (icon-only when no children) |
| `children`   | `ReactNode` | —            | Label                                     |
| `disabled`   | `boolean`   | —            | Disable the item                          |
| `aria-label` | `string`    | —            | Name for icon-only items                  |

Type exports: `ToggleGroupProps`, `ToggleGroupSingleProps`, `ToggleGroupMultipleProps`, `ToggleGroupItemProps`.

```tsx
<ToggleGroup type="single" defaultValue="left" aria-label="Align">
  <ToggleGroupItem value="left" icon={<AlignLeft />} aria-label="Left" />
  <ToggleGroupItem value="center" icon={<AlignCenter />} aria-label="Center" />
</ToggleGroup>
```

### Accordion

Collapsible sections built on React Aria `DisclosureGroup`. Unstyled internals are
left to React Aria, so keyboard and screen-reader behaviour comes from the base
library rather than from this wrapper.

|                                                                                                         | Values                    |
| ------------------------------------------------------------------------------------------------------- | ------------------------- |
| **Variants**                                                                                            | `default` · `bordered`    |
| `Accordion` accepts all `DisclosureGroupProps` except `className` (single or                            |
| multiple expanded panels, `expandedKeys` / `defaultExpandedKeys`, `onExpandedChange`).                  |
| Prop                                                                                                    | Type                      | Default   | Description              |
| ---                                                                                                     | ---                       | ---       | ---                      |
| `variant`                                                                                               | `"default" \| "bordered"` | `default` | Panel chrome             |
| `className`                                                                                             | `string`                  | —         | Extra class on the group |
| Type exports: `AccordionProps`, `AccordionItemProps`, `AccordionTriggerProps`, `AccordionContentProps`. |

#### AccordionItem

One collapsible section. Accepts all `DisclosureProps` except `className`.

| Prop        | Type     | Description                             |
| ----------- | -------- | --------------------------------------- |
| `id`        | `string` | Panel identifier used by `expandedKeys` |
| `className` | `string` | Extra class                             |

#### AccordionTrigger

The button that toggles a panel. Wrap the trigger in `AccordionItem`, then place
`AccordionContent` after it.

| Prop           | Type                    | Description                           |
| -------------- | ----------------------- | ------------------------------------- |
| `children`     | `ReactNode`             | Trigger label (**required**)          |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | Heading level for the trigger wrapper |
| `className`    | `string`                | Extra class                           |

#### AccordionContent

The expanding panel. Accepts all `DisclosurePanelProps` except `className`.

```tsx
<Accordion variant="bordered" defaultExpandedKeys={["shipping"]}>
  <AccordionItem id="shipping">
    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
    <AccordionContent>Two to five business days.</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### FormField

Layout wrapper that renders a `Label`, control, description, and error with linked ids. Used internally by inputs; available directly for custom controls.

| Prop                    | Type        | Default      | Description                              |
| ----------------------- | ----------- | ------------ | ---------------------------------------- |
| `label`                 | `ReactNode` | —            | Field label                              |
| `htmlFor`               | `string`    | —            | Links label + description/error ids      |
| `required` / `optional` | `boolean`   | —            | Label markers                            |
| `description`           | `ReactNode` | —            | Helper text (hidden when `error` is set) |
| `error`                 | `ReactNode` | —            | Error message (role `alert`)             |
| `children`              | `ReactNode` | **required** | The control                              |

Accepts native `<div>` attributes. Type export: `FormFieldProps`.

```tsx
<FormField label="API key" htmlFor="key" description="Found in project settings">
  <Input id="key" />
</FormField>
```

---

## Feedback

### Alert

Contextual message in card, inline, or floating layout. Also exposes `Alert.ErrorBoundary` (exported as `AlertErrorBoundary`).

|                | Values                                                    |
| -------------- | --------------------------------------------------------- |
| **Variants**   | `info` · `success` · `warning` · `error` (`AlertVariant`) |
| **Types**      | `card` · `inline` · `floating` (`AlertType`)              |
| **Appearance** | `outlined` · `filled` (`AlertAppearance`)                 |

| Prop                     | Type                             | Default                             | Description                                                      |
| ------------------------ | -------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `variant`                | `AlertVariant`                   | `info` (or `warning` when `banner`) | Semantic tone                                                    |
| `type`                   | `AlertType`                      | `card`                              | Layout family                                                    |
| `title`                  | `ReactNode`                      | —                                   | Heading (Ant Design `message`)                                   |
| `message`                | `ReactNode`                      | —                                   | Alias for `title`                                                |
| `description`            | `ReactNode`                      | —                                   | Body text                                                        |
| `banner`                 | `boolean`                        | `false`                             | Full-bleed banner                                                |
| `showIcon`               | `boolean`                        | `true`                              | Show the status icon                                             |
| `icon`                   | `ReactNode \| null`              | default per variant                 | Override (or `null` to hide)                                     |
| `closable`               | `boolean \| AlertClosableConfig` | —                                   | Dismiss control (object adds `closeIcon`/`onClose`/`afterClose`) |
| `closeIcon`              | `ReactNode`                      | `X` (built-in)                      | Custom close glyph                                               |
| `onClose` / `afterClose` | `(e?) => void` / `() => void`    | —                                   | Dismiss callbacks                                                |
| `action`                 | `ReactNode`                      | —                                   | Action slot                                                      |
| `filled`                 | `boolean`                        | —                                   | Tinted card background                                           |
| `appearance`             | `AlertAppearance`                | —                                   | `filled` maps to tinted card                                     |

Accepts native `<div>` attributes (except `title`). Type exports: `AlertProps`, `AlertVariant`, `AlertType`, `AlertAppearance`, `AlertClosableConfig`, `AlertErrorBoundaryProps`.

```tsx
<Alert variant="success" title="Saved" description="Your changes are live." closable />
```

### Tooltip

Hover/focus tooltip (Radix Tooltip). The trigger is passed as `children` via `asChild`.

|              | Values                              |
| ------------ | ----------------------------------- |
| **Variants** | `dark` · `light` (`TooltipVariant`) |
| **Side**     | `top` · `right` · `bottom` · `left` |

| Prop             | Type                                     | Default      | Description     |
| ---------------- | ---------------------------------------- | ------------ | --------------- |
| `content`        | `ReactNode`                              | **required** | Primary label   |
| `supportingText` | `ReactNode`                              | —            | Secondary line  |
| `variant`        | `TooltipVariant`                         | `dark`       | Surface         |
| `side`           | `"top" \| "right" \| "bottom" \| "left"` | `top`        | Placement       |
| `delayDuration`  | `number`                                 | `200`        | Show delay (ms) |
| `children`       | `ReactNode`                              | **required** | Trigger element |

Type exports: `TooltipProps`, `TooltipVariant`.

```tsx
<Tooltip content="Copy link" side="bottom">
  <IconButton aria-label="Copy">
    <Link />
  </IconButton>
</Tooltip>
```

### ProgressBar

Determinate progress indicator with `role="progressbar"`.

| Prop        | Type        | Default      | Description             |
| ----------- | ----------- | ------------ | ----------------------- |
| `value`     | `number`    | **required** | Current value           |
| `max`       | `number`    | `100`        | Maximum                 |
| `label`     | `ReactNode` | —            | Header label            |
| `showValue` | `boolean`   | `true`       | Percentage on the right |

Accepts native `<div>` attributes. Type export: `ProgressBarProps`.

```tsx
<ProgressBar value={64} label="Uploading" />
```

### Modal

Centered dialog (Radix Dialog) with header, body, and footer slots.

|           | Values                                  |
| --------- | --------------------------------------- |
| **Sizes** | `sm` · `md` · `lg` · `xl` (`ModalSize`) |

| Prop                               | Type                             | Default | Description                            |
| ---------------------------------- | -------------------------------- | ------- | -------------------------------------- |
| `open` / `defaultOpen`             | `boolean`                        | —       | Controlled / uncontrolled              |
| `onOpenChange`                     | `(open: boolean) => void`        | —       | Open-state handler                     |
| `title` / `description` / `footer` | `ReactNode`                      | —       | Layout slots                           |
| `size`                             | `ModalSize`                      | `md`    | Width                                  |
| `closeButton`                      | `boolean`                        | `true`  | Show the close icon                    |
| `closeOnEscape`                    | `boolean`                        | `true`  | Close on Escape                        |
| `closeOnBackdropClick`             | `boolean`                        | `true`  | Close on outside click                 |
| `originRef`                        | `RefObject<HTMLElement \| null>` | —       | Trigger to pop from (transform-origin) |
| `children`                         | `ReactNode`                      | —       | Body content                           |

Enter/exit uses a scale + fade pop animation. Pass `originRef` so the modal appears to grow from the trigger button. On small screens it slides up as a bottom sheet.

Type exports: `ModalProps`, `ModalSize`.

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

<Button ref={triggerRef} onClick={() => setOpen(true)}>Delete</Button>
<Modal open={open} onOpenChange={setOpen} originRef={triggerRef} title="Delete project" footer={<Button variant="primary-destructive">Delete</Button>}>
  This action cannot be undone.
</Modal>
```

### Drawer

Edge-anchored panel (Radix Dialog).

|           | Values                                             |
| --------- | -------------------------------------------------- |
| **Side**  | `left` · `right` · `top` · `bottom` (`DrawerSide`) |
| **Sizes** | `sm` · `md` · `lg` (`DrawerSize`)                  |

| Prop                               | Type                      | Default | Description               |
| ---------------------------------- | ------------------------- | ------- | ------------------------- |
| `open` / `defaultOpen`             | `boolean`                 | —       | Controlled / uncontrolled |
| `onOpenChange`                     | `(open: boolean) => void` | —       | Open-state handler        |
| `title` / `description` / `footer` | `ReactNode`               | —       | Layout slots              |
| `side`                             | `DrawerSide`              | `right` | Anchor edge               |
| `size`                             | `DrawerSize`              | `md`    | Panel size                |
| `closeButton`                      | `boolean`                 | `true`  | Show the close icon       |
| `children`                         | `ReactNode`               | —       | Body content              |

Type exports: `DrawerProps`, `DrawerSide`, `DrawerSize`.

```tsx
<Drawer open={open} onOpenChange={setOpen} side="right" title="Filters">
  …
</Drawer>
```

### Notification

Toast system (Radix Toast) with an imperative API and a provider. Mount `NotificationProvider` once near the app root, then call `notification.*` anywhere.

|                | Values                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Variants**   | `success` · `info` · `warning` · `error` (`NotificationVariant`)                                   |
| **Layouts**    | `default` · `avatar` · `image` · `progress` (`NotificationLayout`)                                 |
| **Placements** | `top` · `topLeft` · `topRight` · `bottom` · `bottomLeft` · `bottomRight` (`NotificationPlacement`) |

Layout is inferred when omitted: `avatar` when `avatar` is set, `image` when `image` is set, `progress` when `progress` is set, else `default`.

**Imperative API**

| Function                                                    | Signature                       | Description                                  |
| ----------------------------------------------------------- | ------------------------------- | -------------------------------------------- |
| `notification.success` / `.info` / `.warning` / `.error`    | `(title, options?) \| (config)` | Push a notification of that variant          |
| `notification.open`                                         | `(config)`                      | Push using `config.variant` (default `info`) |
| `notification.avatar` / `.image` / `.progress`              | `(config)`                      | Push with the matching layout                |
| `notification.destroy` / `.dismiss` / `dismissNotification` | `(id?)`                         | Dismiss one (by id) or all                   |
| `notification.config` / `configureNotification`             | `(NotificationGlobalConfig)`    | Update global defaults                       |

**NotificationOptions** (key fields)

| Prop                | Type                                          | Default             | Description                                   |
| ------------------- | --------------------------------------------- | ------------------- | --------------------------------------------- |
| `title` / `message` | `ReactNode`                                   | —                   | Heading (`message` is an alias)               |
| `description`       | `ReactNode`                                   | —                   | Body                                          |
| `duration`          | `number \| false`                             | `4500`              | Auto-close ms; `0`/`false` stays open         |
| `placement`         | `NotificationPlacement`                       | `topRight`          | Viewport corner                               |
| `variant`           | `NotificationVariant`                         | per method          | Tone                                          |
| `layout`            | `NotificationLayout`                          | inferred            | Layout family                                 |
| `avatar`            | `ReactNode \| NotificationAvatarConfig`       | —                   | Leading avatar                                |
| `image`             | `ReactNode \| NotificationImageConfig`        | —                   | Leading media                                 |
| `progress`          | `number \| NotificationContentProgressConfig` | —                   | Content progress bar                          |
| `action`            | `NotificationAction`                          | —                   | Single text action `{ label, onClick }`       |
| `actions`           | `ReactNode`                                   | —                   | Custom action group                           |
| `icon`              | `ReactNode \| null`                           | default per variant | Status icon override                          |
| `closable`          | `boolean \| NotificationClosableConfig`       | `true`              | Close control                                 |
| `closeIcon`         | `ReactNode \| false \| null`                  | provider default    | Close glyph                                   |
| `showProgress`      | `boolean`                                     | `false`             | Auto-close progress strip                     |
| `animated`          | `boolean \| { enabled?, delay? }`             | `true`              | Spring enter/exit; `{ delay }` staggers in ms |
| `pauseOnHover`      | `boolean`                                     | `true`              | Pause timer on hover                          |
| `role`              | `"alert" \| "status"`                         | `alert`             | ARIA role                                     |
| `id` / `key`        | `string`                                      | auto                | Same key updates an existing toast            |

**NotificationProvider** (extends `NotificationGlobalConfig`)

| Prop             | Type                                                    | Default            | Description                                                     |
| ---------------- | ------------------------------------------------------- | ------------------ | --------------------------------------------------------------- |
| `duration`       | `number \| false`                                       | `4500`             | Default auto-close                                              |
| `placement`      | `NotificationPlacement`                                 | `topRight`         | Default corner                                                  |
| `top` / `bottom` | `number`                                                | `24`               | Viewport offsets (px)                                           |
| `maxCount`       | `number`                                                | —                  | Max visible; older ones drop                                    |
| `animated`       | `boolean \| { enabled?, delay? }`                       | `true`             | Spring enter/exit (scale + opacity); `{ delay }` for stagger ms |
| `stack`          | `NotificationStackConfig` (`boolean \| { threshold? }`) | `{ threshold: 3 }` | Stacking behavior                                               |
| `showProgress`   | `boolean`                                               | `false`            | Default progress strip                                          |
| `pauseOnHover`   | `boolean`                                               | `true`             | Default pause behavior                                          |
| `closeIcon`      | `ReactNode \| false \| null`                            | —                  | Default close glyph                                             |
| `rtl`            | `boolean`                                               | `false`            | Right-to-left layout                                            |
| `getContainer`   | `() => HTMLElement \| null`                             | `document.body`    | Portal target                                                   |

Type exports: `NotificationProviderProps`, `NotificationOptions`, `NotificationConfig`, `NotificationVariant`, `NotificationLayout`, `NotificationAvatarConfig`, `NotificationImageConfig`, `NotificationContentProgressConfig`, `NotificationAction`, `NotificationPlacement`, `NotificationClosableConfig`, `NotificationGlobalConfig`, `NotificationStackConfig`, `NotificationAnimationConfig`.

```tsx
<NotificationProvider placement="bottomRight" animated />;

notification.success("Saved", { description: "Your changes are live." });
notification.info({ title: "Queued", animated: { delay: 1000 } });
notification.progress({ title: "Uploading", progress: { value: 40 } });
```

### Skeleton

Loading placeholder.

|              | Values                                                  |
| ------------ | ------------------------------------------------------- |
| **Variants** | `text` · `circular` · `rectangular` (`SkeletonVariant`) |

| Prop      | Type               | Default | Description                                  |
| --------- | ------------------ | ------- | -------------------------------------------- |
| `variant` | `SkeletonVariant`  | `text`  | Shape                                        |
| `width`   | `number \| string` | —       | Width                                        |
| `height`  | `number \| string` | —       | Height                                       |
| `lines`   | `number`           | `1`     | Line count for `text` (last line is shorter) |

Accepts native `<div>` attributes. Type exports: `SkeletonProps`, `SkeletonVariant`.

```tsx
<Skeleton variant="text" lines={3} />
```

---

## Charts

Dependency-free SVG charts. No charting library is bundled: each chart is a small
component that renders inline SVG, sizes itself to its container, and shares the
`ChartTooltip` focus model. Every chart takes an explicit `label` because the
figure is not decorative.
Shared prop shape across all three: `className`, `style`, and `valueFormatter`.

### PieChart

Donut or pie with optional legend, slice labels, and a centre readout.

| Prop                                            | Type                        | Default      | Description                                                           |
| ----------------------------------------------- | --------------------------- | ------------ | --------------------------------------------------------------------- |
| `data`                                          | `PieChartDatum[]`           | **required** | Slices as `{ label, value, color? }`                                  |
| `label`                                         | `string`                    | **required** | Accessible chart name                                                 |
| `innerRadius`                                   | `number`                    | —            | Hole radius as a percentage of the outer radius. `0` draws a full pie |
| `height`                                        | `number`                    | —            | Figure height in CSS pixels                                           |
| `showLegend`                                    | `boolean`                   | —            | Render the legend                                                     |
| `showLabels`                                    | `boolean`                   | —            | Draw labels on slices                                                 |
| `centerLabel`                                   | `string`                    | —            | Text in the donut hole                                                |
| `valueFormatter`                                | `(value: number) => string` | —            | Format tooltip and legend values                                      |
| `className`                                     | `string`                    | —            | Extra class on the root                                               |
| `style`                                         | `CSSProperties`             | —            | Inline styles on the root                                             |
| Type exports: `PieChartProps`, `PieChartDatum`. |

```tsx
<PieChart
  label="Traffic sources"
  data={[
    { label: "Direct", value: 42 },
    { label: "Search", value: 31 },
    { label: "Social", value: 27 },
  ]}
  innerRadius={62}
  showLegend
/>
```

### BarChart

Grouped or stacked bars, vertical or horizontal, with one or two series.

| Prop                                                                               | Type                         | Default      | Description                                                       |
| ---------------------------------------------------------------------------------- | ---------------------------- | ------------ | ----------------------------------------------------------------- |
| `data`                                                                             | `BarChartDatum[]`            | **required** | Rows as `{ label, [seriesKey]: number }`                          |
| `series`                                                                           | `BarChartSeries[]`           | **required** | Series as `{ key, label, color? }`                                |
| `label`                                                                            | `string`                     | **required** | Accessible chart name                                             |
| `color`                                                                            | `BarChartColor`              | `brand`      | Primary palette colour; the second series uses a 45% lighter tint |
| `layout`                                                                           | `"vertical" \| "horizontal"` | —            | Bar direction                                                     |
| `stacked`                                                                          | `boolean`                    | —            | Stack series instead of grouping                                  |
| `height`                                                                           | `number`                     | —            | Figure height in CSS pixels                                       |
| `showLegend`                                                                       | `boolean`                    | —            | Render the legend                                                 |
| `showGrid`                                                                         | `boolean`                    | —            | Draw gridlines                                                    |
| `valueFormatter`                                                                   | `(value: number) => string`  | —            | Format tooltip and axis values                                    |
| `className`                                                                        | `string`                     | —            | Extra class on the root                                           |
| `style`                                                                            | `CSSProperties`              | —            | Inline styles on the root                                         |
| `BarChartColor` is the same ten-value union as `BadgeColor`: `brand`, `gray`,      |
| `error`, `warning`, `success`, `blue`, `indigo`, `purple`, `pink`, `orange`.       |
| Type exports: `BarChartProps`, `BarChartDatum`, `BarChartSeries`, `BarChartColor`. |

```tsx
<BarChart
  label="Signups per month"
  data={[
    { label: "Jan", new: 120, returning: 60 },
    { label: "Feb", new: 180, returning: 74 },
  ]}
  series={[
    { key: "new", label: "New" },
    { key: "returning", label: "Returning" },
  ]}
  stacked
/>
```

### ChartTooltip

Focusable tooltip anchored to any SVG mark. Charts use it internally; it is
exported for custom marks.

| Prop                                                   | Type                                 | Default      | Description                                        |
| ------------------------------------------------------ | ------------------------------------ | ------------ | -------------------------------------------------- |
| `label`                                                | `string`                             | **required** | Tooltip heading                                    |
| `items`                                                | `ChartTooltipItem[]`                 | **required** | Rows as `{ label, value, color, supportingText? }` |
| `children`                                             | `ReactElement<SVGProps<SVGElement>>` | **required** | The focusable mark (SVG rect, path, …)             |
| Type exports: `ChartTooltipProps`, `ChartTooltipItem`. |

---

## Data display

### DataTable

High-level table with search, filters, sorting, pagination, selection, expansion, column visibility, and grid view. Works in client or server mode. Generic over the row type `T`.

|                      | Values                                                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mode**             | `client` · `server` (`DataTableMode`)                                                                                                                                                          |
| **View mode**        | `list` · `grid` (`DataTableViewMode`)                                                                                                                                                          |
| **Row density**      | `compact` · `standard` · `comfortable` (`DataTableRowDensity`)                                                                                                                                 |
| **Filter operators** | `eq` · `neq` · `contains` · `startsWith` · `endsWith` · `gt` · `gte` · `lt` · `lte` · `in` · `notIn` · `between` · `isNull` · `isNotNull` (`DataTableFilterOperator`)                          |
| **Filter types**     | `text` · `select` · `multi-select` · `checkbox` · `radio` · `date` · `date-range` · `number` · `number-range` · `boolean` · `search-select` · `tree-select` · `custom` (`DataTableFilterType`) |

**Key props**

| Prop                           | Type                                         | Default         | Description                                                                              |
| ------------------------------ | -------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------- |
| `columns`                      | `DataTableColumn<T>[]`                       | **required**    | Column definitions                                                                       |
| `data`                         | `T[]`                                        | **required**    | Row data                                                                                 |
| `mode`                         | `DataTableMode`                              | `client`        | Client pipeline vs. server-driven                                                        |
| `query` / `defaultQuery`       | `DataTableQuery` / `Partial<DataTableQuery>` | `DEFAULT_QUERY` | Controlled / initial query                                                               |
| `onQueryChange`                | `(query: DataTableQuery) => void`            | —               | Query change handler                                                                     |
| `total`                        | `number`                                     | —               | Row count (server mode)                                                                  |
| `loading`                      | `boolean`                                    | —               | Loading state                                                                            |
| `error`                        | `boolean \| Error \| ReactNode`              | —               | Error state                                                                              |
| `search`                       | `boolean \| DataTableSearchConfig`           | —               | Search box (`true` → placeholder `Search`, `debounceMs` 300)                             |
| `pagination`                   | `boolean \| DataTablePaginationConfig`       | —               | Pagination controls                                                                      |
| `resetPageOn`                  | `DataTableResetPageOn`                       | all `true`      | When to reset to page 1                                                                  |
| `rowSelection`                 | `DataTableRowSelection<T>`                   | —               | Checkbox selection                                                                       |
| `columnVisibility`             | `boolean \| DataTableColumnVisibility`       | —               | Column toggles                                                                           |
| `expandable`                   | `DataTableExpandable<T>`                     | —               | Expandable rows                                                                          |
| `empty`                        | `DataTableEmptyConfig \| ReactNode`          | —               | Empty state                                                                              |
| `errorConfig`                  | `DataTableErrorConfig`                       | —               | Error state content                                                                      |
| `viewMode` / `defaultViewMode` | `DataTableViewMode`                          | —               | List/grid toggle                                                                         |
| `renderGridItem`               | `(record, index) => ReactNode`               | —               | Grid renderer                                                                            |
| `stickyHeader`                 | `boolean`                                    | —               | Sticky header row                                                                        |
| `rowDensity`                   | `DataTableRowDensity`                        | `standard`      | Row height tier; sets root `data-density` and `--cx-datatable-row-height` (32 / 40 / 48) |
| `rowActions`                   | `(record, index) => ReactNode`               | —               | Trailing row actions                                                                     |

**Design tokens** (on the table root): `--cx-datatable-row-height` (default 40), `--cx-datatable-header-height` (44), `--cx-datatable-border`, `--cx-datatable-active-bg`.

`DataTableColumn<T>` fields include `key`, `title`, `dataIndex` (supports nested paths such as `"network.ingress.ip"` or `string[]`), `width`, `minWidth`, `sortable` (`boolean \| { multi?, compare? }`), `filter` (`DataTableColumnFilter`), `render`, `hidden`, `align` (`left`/`center`/`right`), and `fixed` (`left`/`right`). `DataTableQuery` is `{ page, pageSize, search?, sort?, filters? }`; `DataTableSort` is `{ field, order: "asc" \| "desc" }`; `DataTableFilterValue` is `{ field, operator?, value? }`.

**Query helpers** (also exported)

| Export                                                           | Description                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `DEFAULT_QUERY`                                                  | `{ page: 1, pageSize: 10 }`                                      |
| `DEFAULT_RESET_PAGE_ON`                                          | `{ search: true, filter: true, pageSize: true, sort: true }`     |
| `mergeQuery(base, patch)`                                        | Merge a query patch                                              |
| `withPageReset(prev, patch, resetOn?)`                           | Merge and reset page when configured                             |
| `applyClientPipeline(data, columns, query, options?)`            | Run search → filter → sort → paginate; returns `{ rows, total }` |
| `applySearch` / `applyFilters` / `applySort` / `applyPagination` | Individual pipeline steps                                        |
| `parseDataTableQuery(params)`                                    | Parse a query from `URLSearchParams` / record / string           |
| `serializeDataTableQuery(query)`                                 | Serialize to a `Record<string, string>`                          |
| `serializeDataTableQueryToURLSearchParams(query)`                | Serialize to `URLSearchParams`                                   |

Type exports: `DataTableColumn`, `DataTableColumnFilter`, `DataTableColumnVisibility`, `DataTableEmptyConfig`, `DataTableErrorConfig`, `DataTableExpandable`, `DataTableFilterOperator`, `DataTableFilterOption`, `DataTableFilterType`, `DataTableFilterValue`, `DataTableMode`, `DataTablePagination`, `DataTablePaginationConfig`, `DataTableProps`, `DataTableQuery`, `DataTableResetPageOn`, `DataTableRowDensity`, `DataTableRowSelection`, `DataTableSearchConfig`, `DataTableSort`, `DataTableViewMode`.

```tsx
<DataTable
  data={users}
  columns={[{ key: "name", title: "Name", dataIndex: "name", sortable: true }]}
  search
  pagination
/>
```

### Table

Lower-level table (TanStack Table) with sorting and row selection. Generic over `T`.

| Prop                         | Type                              | Default           | Description                                           |
| ---------------------------- | --------------------------------- | ----------------- | ----------------------------------------------------- |
| `columns`                    | `TableColumn<T>[]`                | **required**      | `{ id, header, accessor?, cell?, sortable?, width? }` |
| `data`                       | `T[]`                             | **required**      | Rows                                                  |
| `loading`                    | `boolean`                         | —                 | Renders skeleton rows                                 |
| `empty`                      | `ReactNode`                       | `EmptyState`      | Empty content                                         |
| `getRowId`                   | `(row, index) => string`          | `row.id` or index | Row id resolver                                       |
| `selection`                  | `TableSelection`                  | —                 | `{ selectedIds, onChange }`                           |
| `sorting` / `defaultSorting` | `TableSorting`                    | `null`            | Controlled / uncontrolled sort                        |
| `onSortingChange`            | `(sorting: TableSorting) => void` | —                 | Sort handler                                          |
| `caption`                    | `string`                          | —                 | Table caption                                         |

`TableSorting` is `{ id, desc } | null`. Type exports: `TableProps`, `TableColumn`, `TableSorting`, `TableSelection`.

```tsx
<Table columns={[{ id: "name", header: "Name", accessor: "name", sortable: true }]} data={rows} />
```

### Pagination

Standalone pagination control (used by `DataTable`).

| Prop               | Type                         | Default                            | Description                      |
| ------------------ | ---------------------------- | ---------------------------------- | -------------------------------- |
| `page`             | `number`                     | **required**                       | Current page                     |
| `pageSize`         | `number`                     | **required**                       | Rows per page                    |
| `total`            | `number`                     | **required**                       | Total rows                       |
| `onPageChange`     | `(page: number) => void`     | **required**                       | Page handler                     |
| `onPageSizeChange` | `(pageSize: number) => void` | —                                  | Enables the rows-per-page select |
| `pageSizeOptions`  | `number[]`                   | `[10, 20, 50]`                     | Select options                   |
| `showFirstLast`    | `boolean`                    | `false`                            | First/last buttons               |
| `metaLabel`        | `string \| (meta) => string` | `Showing {start}–{end} of {total}` | Meta text/template               |

Type export: `PaginationProps`.

```tsx
<Pagination page={page} pageSize={20} total={240} onPageChange={setPage} />
```

### EmptyState

Placeholder for empty content with optional action.

| Prop          | Type         | Default      | Description                         |
| ------------- | ------------ | ------------ | ----------------------------------- |
| `title`       | `ReactNode`  | **required** | Heading                             |
| `description` | `ReactNode`  | —            | Supporting text                     |
| `icon`        | `ReactNode`  | —            | Leading icon                        |
| `action`      | `ReactNode`  | —            | Custom action node                  |
| `actionLabel` | `string`     | —            | Renders a primary `Button` when set |
| `onAction`    | `() => void` | —            | Button handler                      |

Accepts native `<div>` attributes. Type export: `EmptyStateProps`.

```tsx
<EmptyState icon={<Inbox />} title="No messages" actionLabel="Compose" onAction={compose} />
```

---

## Navigation

### Tabs

Tab list with optional inline content (Radix Tabs).

| Prop                     | Type                      | Default       | Description                               |
| ------------------------ | ------------------------- | ------------- | ----------------------------------------- |
| `items`                  | `TabItem[]`               | **required**  | `{ value, label, content?, disabled? }`   |
| `value` / `defaultValue` | `string`                  | first enabled | Controlled / uncontrolled                 |
| `onValueChange`          | `(value: string) => void` | —             | Change handler                            |
| `children`               | `ReactNode`               | —             | Custom content (overrides `item.content`) |

Type exports: `TabsProps`, `TabItem`.

```tsx
<Tabs
  defaultValue="overview"
  items={[
    { value: "overview", label: "Overview", content: <Overview /> },
    { value: "activity", label: "Activity", content: <Activity /> },
  ]}
/>
```

### Breadcrumb

Breadcrumb trail; the last item (or `current`) renders as plain text.

| Prop    | Type               | Default      | Description                  |
| ------- | ------------------ | ------------ | ---------------------------- |
| `items` | `BreadcrumbItem[]` | **required** | `{ label, href?, current? }` |

Type exports: `BreadcrumbProps`, `BreadcrumbItem`.

```tsx
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Settings" }]} />
```

### Dropdown

Menu built on Radix Dropdown Menu. Supply `items` or custom `children`. `DropdownItem` and `DropdownSeparator` re-export the Radix primitives for advanced composition.

|           | Values                     |
| --------- | -------------------------- |
| **Align** | `start` · `center` · `end` |

| Prop       | Type                           | Default      | Description                                   |
| ---------- | ------------------------------ | ------------ | --------------------------------------------- |
| `trigger`  | `ReactNode`                    | **required** | Trigger element (`asChild`)                   |
| `items`    | `DropdownEntry[]`              | —            | `DropdownItem` or `DropdownSeparator` entries |
| `children` | `ReactNode`                    | —            | Custom menu content                           |
| `align`    | `"start" \| "center" \| "end"` | `start`      | Menu alignment                                |

`DropdownItem` fields: `key`, `label`, `disabled?`, `destructive?`, `onSelect?`, `icon?`. `DropdownSeparator`: `{ type: "separator", key? }`. Type exports: `DropdownProps`, `DropdownEntry`.

```tsx
<Dropdown
  trigger={<Button variant="secondary">Actions</Button>}
  items={[
    { key: "edit", label: "Edit", onSelect: edit },
    { type: "separator" },
    { key: "delete", label: "Delete", destructive: true, onSelect: remove },
  ]}
/>
```

---

## Date & file

### DatePicker

Single or multiple date selection with optional time and picker granularity (built on react-day-picker + Radix Popover).

|                 | Values                                                        |
| --------------- | ------------------------------------------------------------- |
| **Picker mode** | `date` · `week` · `month` · `quarter` · `year` (`PickerMode`) |
| **Sizes**       | `sm` · `md` · `lg` (`PickerSize`)                             |

| Prop                                                                        | Type                                                            | Default                          | Description                              |
| --------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------- | ---------------------------------------- |
| `multiple`                                                                  | `boolean`                                                       | `false`                          | Multiple selection (disables `showTime`) |
| `value` / `defaultValue`                                                    | `Date` (single) / `Date[]` (multiple)                           | —                                | Selection                                |
| `onChange`                                                                  | `(date: Date \| undefined) => void` / `(dates: Date[]) => void` | —                                | Change handler (typed per mode)          |
| `picker`                                                                    | `PickerMode`                                                    | `date`                           | Granularity                              |
| `showTime`                                                                  | `ShowTimeConfig` (`boolean \| ShowTimeOptions`)                 | —                                | Add a time panel (single only)           |
| `size`                                                                      | `PickerSize`                                                    | `md`                             | Trigger height                           |
| `placeholder`                                                               | `string`                                                        | `Select date`                    | Empty text                               |
| `format`                                                                    | `string`                                                        | derived from `picker`/`showTime` | Display format                           |
| `allowClear`                                                                | `boolean`                                                       | `true`                           | Clear control                            |
| `minDate` / `maxDate`                                                       | `Date`                                                          | —                                | Bounds                                   |
| `disabledDates`                                                             | `DisabledDates` (`Date[] \| (date) => boolean`)                 | —                                | Disabled days                            |
| `open` / `defaultOpen` / `onOpenChange`                                     | —                                                               | —                                | Popover state                            |
| `label` / `required` / `optional` / `description` / `error` / `name` / `id` | —                                                               | —                                | Field chrome                             |

`ShowTimeOptions`: `{ format?, hourStep?, minuteStep?, secondStep?, use12Hours? }`. Type exports: `DatePickerProps`, `SingleDatePickerProps`, `MultipleDatePickerProps`, `PickerMode`, `PickerSize`, `ShowTimeConfig`, `ShowTimeOptions`, `DisabledDates`, `PickerFieldProps`.

```tsx
<DatePicker label="Due date" showTime picker="date" />
<DatePicker multiple label="Blackout days" />
```

### RangePicker

Date-range selection with optional time.

| Prop                                                                        | Type                              | Default                              | Description              |
| --------------------------------------------------------------------------- | --------------------------------- | ------------------------------------ | ------------------------ |
| `value` / `defaultValue`                                                    | `DateRangeValue` (`{ from, to }`) | `{ from: undefined, to: undefined }` | Range selection          |
| `onChange`                                                                  | `(range: DateRangeValue) => void` | —                                    | Change handler           |
| `showTime`                                                                  | `ShowTimeConfig`                  | —                                    | Add time panels          |
| `placeholder`                                                               | `[string, string]`                | `["Start date", "End date"]`         | Start/end placeholders   |
| `allowEmpty`                                                                | `[boolean, boolean]`              | `[true, true]`                       | Allow empty start/end    |
| `size`                                                                      | `PickerSize`                      | `md`                                 | Trigger height           |
| `allowClear`                                                                | `boolean`                         | `true`                               | Clear control            |
| `minDate` / `maxDate` / `disabledDates`                                     | —                                 | —                                    | Bounds and disabled days |
| `label` / `required` / `optional` / `description` / `error` / `name` / `id` | —                                 | —                                    | Field chrome             |

Type exports: `RangePickerProps`, `DateRangeValue`.

```tsx
<RangePicker label="Reporting period" allowEmpty={[false, true]} />
```

### TimePicker

Time-only selection with configurable steps.

| Prop                                                                        | Type                                | Default       | Description     |
| --------------------------------------------------------------------------- | ----------------------------------- | ------------- | --------------- |
| `value` / `defaultValue`                                                    | `Date`                              | —             | Selected time   |
| `onChange`                                                                  | `(time: Date \| undefined) => void` | —             | Change handler  |
| `format`                                                                    | `string`                            | `HH:mm:ss`    | Display format  |
| `hourStep` / `minuteStep` / `secondStep`                                    | `number`                            | `1`           | Step increments |
| `use12Hours`                                                                | `boolean`                           | `false`       | 12-hour clock   |
| `placeholder`                                                               | `string`                            | `Select time` | Empty text      |
| `size`                                                                      | `PickerSize`                        | `md`          | Trigger height  |
| `allowClear`                                                                | `boolean`                           | `true`        | Clear control   |
| `label` / `required` / `optional` / `description` / `error` / `name` / `id` | —                                   | —             | Field chrome    |

Type export: `TimePickerProps`.

```tsx
<TimePicker label="Reminder" minuteStep={5} use12Hours />
```

### FileUpload

Drag-and-drop uploader with a file list. Also re-exports `FileListItem`, `FileTypeIcon`, `formatFileSize`, and `extensionFromName`.

|                      | Values                                         |
| -------------------- | ---------------------------------------------- |
| **Progress variant** | `bar` · `fill` (`FileListItemProgressVariant`) |
| **Upload status**    | `queued` · `uploading` · `success` · `error`   |

| Prop                                                                                 | Type                            | Default | Description                  |
| ------------------------------------------------------------------------------------ | ------------------------------- | ------- | ---------------------------- |
| `accept`                                                                             | `string`                        | —       | Accepted MIME/extension list |
| `multiple`                                                                           | `boolean`                       | `true`  | Allow multiple files         |
| `maxSize`                                                                            | `number`                        | —       | Max bytes per file           |
| `maxFiles`                                                                           | `number`                        | —       | Max file count               |
| `files`                                                                              | `UploadFile[]`                  | —       | Controlled file list         |
| `onFilesChange`                                                                      | `(files: UploadFile[]) => void` | —       | List change handler          |
| `onRetry`                                                                            | `(file: UploadFile) => void`    | —       | Retry handler                |
| `progressVariant`                                                                    | `FileListItemProgressVariant`   | `bar`   | Progress style               |
| `label` / `required` / `optional` / `description` / `hint` / `error` / `name` / `id` | —                               | —       | Field chrome                 |

`UploadFile`: `{ id, file?, name?, size?, type?, thumbnailUrl?, progress?, error?, status?, failed? }`. Type exports: `FileUploadProps`, `UploadFile`.

```tsx
<FileUpload label="Attachments" accept="image/*" maxSize={5_000_000} />
```

### FileListItem

Single file row with progress, status, delete, and retry. Rendered by `FileUpload`; usable standalone.

| Prop                   | Type                          | Default      | Description                                |
| ---------------------- | ----------------------------- | ------------ | ------------------------------------------ |
| `name`                 | `string`                      | **required** | File name                                  |
| `size`                 | `number`                      | **required** | Bytes (formatted via `formatFileSize`)     |
| `progress`             | `number`                      | `0`          | Percent (0–100)                            |
| `failed`               | `boolean`                     | `false`      | Failed state                               |
| `type`                 | `string`                      | —            | MIME/extension for the type glyph          |
| `thumbnailUrl`         | `string`                      | —            | Image preview (replaces type icon)         |
| `progressVariant`      | `FileListItemProgressVariant` | `bar`        | `bar` (progress bar) or `fill` (card fill) |
| `onDelete` / `onRetry` | `() => void`                  | —            | Row actions                                |
| `statusLabel`          | `ReactNode`                   | —            | Custom status text                         |

Accepts native `<li>` attributes. Type exports: `FileListItemProps`, `FileListItemProgressVariant`.

### FileTypeIcon

Colored file-type glyph derived from a filename or extension.

|              | Values                                      |
| ------------ | ------------------------------------------- |
| **Variants** | `default` · `solid` (`FileTypeIconVariant`) |

| Prop      | Type                  | Default   | Description                                          |
| --------- | --------------------- | --------- | ---------------------------------------------------- |
| `type`    | `string`              | `""`      | File name or extension (e.g. `invoice.pdf` or `pdf`) |
| `variant` | `FileTypeIconVariant` | `default` | Flat or solid                                        |

Accepts native `<span>` attributes. Type exports: `FileTypeIconProps`, `FileTypeIconVariant`. Helper exports: `formatFileSize(bytes)` and `extensionFromName(name)`.

```tsx
<FileTypeIcon type="report.pdf" />
```

---

## Visuals

Thirty-four GPU-rendered effect components. Each one fills its parent, draws behind
children, and shares the same baseline props.

### Shared baseline

Every component in this section accepts these unless the component table says
otherwise:

| Prop                   | Type            | Default  | Description                                         |
| ---------------------- | --------------- | -------- | --------------------------------------------------- |
| `children`             | `ReactNode`     | —        | Content layered above the canvas                    |
| `paused`               | `boolean`       | `false`  | Render one static frame                             |
| `respectReducedMotion` | `boolean`       | `true`   | Honour `prefers-reduced-motion` with a static frame |
| `quality`              | `VisualQuality` | `medium` | Renderer resolution cap: `low` · `medium` · `high`  |
| `className`            | `string`        | —        | Extra class on the root                             |
| `style`                | `CSSProperties` | —        | Inline styles on the root                           |

`VisualQuality` is `"low" | "medium" | "high"`. Lower it first when several
instances share a page.

---

### FluidBackground

Lightweight pointer-driven liquid-ink trails using native Canvas 2D. Fills its parent, draws behind children, stops `requestAnimationFrame` when idle. No WebGL or fluid-simulation dependency. Parent owns the background; the canvas is transparent by default.

| Prop                   | Type                          | Default                                 | Description                                                                                         |
| ---------------------- | ----------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `children`             | `ReactNode`                   | —                                       | Content layered above the canvas                                                                    |
| `colors`               | `string[]`                    | electric blue / cyan / violet / magenta | Trail palette (smoothly interpolated)                                                               |
| `trigger`              | `"hover" \| "always"`         | `hover`                                 | Injection while pointer moves inside                                                                |
| `intensity`            | `number`                      | `0.7`                                   | Stroke strength (0–1)                                                                               |
| `trailPersistence`     | `number`                      | `0.65`                                  | Fade longevity (0–1)                                                                                |
| `quality`              | `"low" \| "medium" \| "high"` | `medium`                                | Internal resolution scale                                                                           |
| `disabled`             | `boolean`                     | `false`                                 | Stop trails / animation                                                                             |
| `transparent`          | `boolean`                     | `true`                                  | Alpha-cleared canvas (parent paints background). `false` fills a midnight tint on the canvas itself |
| `respectReducedMotion` | `boolean`                     | `true`                                  | Honor `prefers-reduced-motion`                                                                      |

Type exports: `FluidBackgroundProps`, `FluidBackgroundQuality`, `FluidBackgroundTrigger`.

```tsx
<FluidBackground colors={["#2563FF", "#22D3EE", "#8B5CF6", "#EC4899"]}>
  <HeroContent />
</FluidBackground>
```

### Vortex

Premium GPU spiral particles with soft persistence trails on native WebGL (Canvas 2D fallback). Fills its parent, draws behind children, transparent by default so the parent owns the background. No Three.js or particle libraries. Animation runs until paused, reduced-motion, tab hidden, or off-screen.

| Prop                   | Type                          | Default                                 | Description                                                   |
| ---------------------- | ----------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `children`             | `ReactNode`                   | —                                       | Content layered above the canvas                              |
| `particles`            | `number`                      | `420`                                   | Base particle count (clamped 40–900; quality/area also scale) |
| `speed`                | `number`                      | `1`                                     | Motion multiplier (0.1–3)                                     |
| `range`                | `number`                      | `1`                                     | Spiral radius scale (0.25–2)                                  |
| `colors`               | `string[]`                    | electric blue / cyan / violet / magenta | Particle palette                                              |
| `intensity`            | `number`                      | `0.65`                                  | Brightness / size (0–1)                                       |
| `trailPersistence`     | `number`                      | `0.7`                                   | Fade longevity (0–1)                                          |
| `quality`              | `"low" \| "medium" \| "high"` | `medium`                                | Internal resolution / particle density                        |
| `centerX`              | `number`                      | `0.5`                                   | Center X as fraction of width (0–1)                           |
| `centerY`              | `number`                      | `0.5`                                   | Center Y as fraction of height (0–1)                          |
| `paused`               | `boolean`                     | `false`                                 | Stop continuous animation                                     |
| `respectReducedMotion` | `boolean`                     | `true`                                  | Honor `prefers-reduced-motion` (static frame)                 |

Type exports: `VortexProps`, `VortexQuality`.

```tsx
<Vortex colors={["#2563FF", "#22D3EE", "#8B5CF6", "#EC4899"]}>
  <HeroContent />
</Vortex>
```

### WaveBackground

Interactive 3D-looking wave surface on native WebGL (GPU mesh displacement + pointer ripples). No Three.js. Fills its parent, draws behind children, transparent by default so the parent owns the background. Falls back to static CSS or a light Canvas 2D undulation when WebGL is unavailable.

| Prop                   | Type                          | Default                       | Description                                     |
| ---------------------- | ----------------------------- | ----------------------------- | ----------------------------------------------- |
| `children`             | `ReactNode`                   | —                             | Content layered above the canvas                |
| `colors`               | `string[]`                    | electric blue / cyan / violet | Wave palette                                    |
| `backgroundColor`      | `string`                      | `#050816`                     | Clear color when `transparent` is false         |
| `speed`                | `number`                      | `1`                           | Animation speed (0.1–3)                         |
| `amplitude`            | `number`                      | `0.45`                        | Wave height (0–1)                               |
| `frequency`            | `number`                      | `1`                           | Spatial frequency (0.25–2)                      |
| `complexity`           | `number`                      | `0.55`                        | Extra wave-layer mix (0–1)                      |
| `intensity`            | `number`                      | `0.7`                         | Lighting / contrast (0–1)                       |
| `interaction`          | `boolean`                     | `true`                        | Pointer deformation                             |
| `interactionStrength`  | `number`                      | `0.65`                        | Dent strength (0–1)                             |
| `interactionRadius`    | `number`                      | `0.22`                        | Influence radius (0.05–0.6)                     |
| `interactionDecay`     | `number`                      | `0.55`                        | Leave decay rate (0.1–1)                        |
| `quality`              | `"low" \| "medium" \| "high"` | `medium`                      | Mesh density / DPR                              |
| `fallback`             | `"static" \| "canvas"`        | `static`                      | Used when WebGL fails                           |
| `paused`               | `boolean`                     | `false`                       | Stop continuous animation                       |
| `transparent`          | `boolean`                     | `true`                        | Alpha-cleared canvas (parent paints background) |
| `respectReducedMotion` | `boolean`                     | `true`                        | Static frame; no pointer deformation            |

Type exports: `WaveBackgroundProps`, `WaveBackgroundQuality`, `WaveBackgroundFallback`.

```tsx
<WaveBackground colors={["#2563FF", "#22D3EE", "#8B5CF6"]}>
  <HeroContent />
</WaveBackground>
```

Manual checklist (verify in a real browser; do not claim unverified 60 FPS): smooth continuous mesh + visible pointer dent/ripple with natural leave decay; buttons above canvas clickable; touch scroll not blocked; resize remaps; tab hide/show and off-screen pause; multi-instance independence; mount/unmount cleanup; WebGL disabled → fallback layout intact; `npx coloxo add wave-background` ships shaders + engine + fallback.

### OrbitingPlanets

Luminous ice-cyan orbital system on native WebGL — soft bloom halos, additive orbit ribbons, pastel spheres with depth occlusion, optional camera parallax. No Three.js. Transparent by default; static CSS fallback when WebGL is unavailable.

| Prop                   | Type                          | Default           | Description                      |
| ---------------------- | ----------------------------- | ----------------- | -------------------------------- |
| `children`             | `ReactNode`                   | —                 | Content layered above the canvas |
| `centralColor`         | `string`                      | `#8ECBFF`         | Central planet color             |
| `centralSize`          | `number`                      | `0.92`            | Central size (0.35–1.2)          |
| `planets`              | `OrbitingPlanetConfig[]`      | curated 6 pastels | Orbiting bodies (max 16)         |
| `showOrbitPaths`       | `boolean`                     | `true`            | Draw luminous elliptical orbits  |
| `orbitColor`           | `string`                      | `#67E8F9`         | Path color                       |
| `orbitOpacity`         | `number`                      | `0.55`            | Path opacity (0–1)               |
| `speed`                | `number`                      | `1`               | Global speed multiplier (0.1–3)  |
| `lightingIntensity`    | `number`                      | `0.78`            | Lighting strength (0–1)          |
| `glowIntensity`        | `number`                      | `0.85`            | Halo / bloom strength (0–1)      |
| `interaction`          | `boolean`                     | `false`           | Camera parallax                  |
| `interactionStrength`  | `number`                      | `0.35`            | Parallax strength (0–1)          |
| `quality`              | `"low" \| "medium" \| "high"` | `medium`          | Tessellation / DPR / bloom       |
| `paused`               | `boolean`                     | `false`           | Stop animation                   |
| `transparent`          | `boolean`                     | `true`            | Alpha-cleared canvas             |
| `respectReducedMotion` | `boolean`                     | `true`            | Static frame when reduced motion |
| `fallback`             | `"static"`                    | `static`          | Used when WebGL fails            |

Type exports: `OrbitingPlanetsProps`, `OrbitingPlanetConfig`, `OrbitingPlanetsQuality`.

```tsx
<OrbitingPlanets>
  <HeroContent />
</OrbitingPlanets>
```

Manual checklist: soft core bloom vs reference; concentric tilted ribbons + gold/cyan flares; pastel planet count/scale; depth occlusion; resize keeps bodies on paths; overlay buttons clickable; optional parallax; tab/off-screen pause; `quality="low"` skips half-res bloom; WebGL disabled → static fallback; `npx coloxo add orbiting-planets` ships shaders + engine + geometry.

### AuroraMeshGradient

Multi-blob mesh gradient with film grain and slow drift.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `blobScale`            | `number`        | `1`           | Spread of each colour blob, 0.4 to 2.                |
| `speed`                | `number`        | `0.35`        | Drift speed, 0 to 1.5.                               |
| `softness`             | `number`        | `0.65`        | Softness of each blob edge, 0 to 1.                  |
| `grain`                | `number`        | `0.035`       | Film grain, 0 to 0.2.                                |
| `colorA`               | `string`        | `Coloxo blue` | First colour.                                        |
| `colorB`               | `string`        | `violet`      | Second colour.                                       |
| `colorC`               | `string`        | `cyan`        | Third colour.                                        |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### BioluminescentParticles

Glowing organisms drifting through dark water.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `density`              | `number`        | `12`          | Grid density multiplier, 4 to 40.                    |
| `glowRadius`           | `number`        | `0.35`        | Glow radius, 0.05 to 1.                              |
| `driftSpeed`           | `number`        | `0.4`         | Drift speed, 0 to 1.5.                               |
| `hueShift`             | `number`        | `0`           | Hue rotation across the palette, 0 to 1.             |
| `bloom`                | `number`        | `1.4`         | Overall glow gain, 0 to 3.                           |
| `colorA`               | `string`        | `cyan`        | Primary organism colour.                             |
| `colorB`               | `string`        | `Coloxo blue` | Secondary organism colour.                           |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### ChromaticAberrationText

Colour-separated glyph with breathing fringing.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `offset`               | `number`        | `1`           | Channel separation strength, 0 to 3.                 |
| `speed`                | `number`        | `0.7`         | Animation speed, 0 to 2.                             |
| `fill`                 | `number`        | `0.28`        | Glyph width as a fraction of the frame, 0.05 to 0.5. |
| `blur`                 | `number`        | `0.2`         | Edge softness, 0 to 1.                               |
| `scanlines`            | `number`        | `0.3`         | Scanline opacity, 0 to 1.                            |
| `colorA`               | `string`        | `Coloxo blue` | Red channel tint.                                    |
| `colorB`               | `string`        | `white`       | Green channel tint.                                  |
| `colorC`               | `string`        | `cyan`        | Blue channel tint.                                   |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### DimensionalPortal

Concentric rings with particles spiralling inward.

| Prop                   | Type            | Default     | Description                                          |
| ---------------------- | --------------- | ----------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —           | Content layered above the canvas.                    |
| `ringCount`            | `number`        | `5`         | Number of concentric rings, 1–7.                     |
| `portalDepth`          | `number`        | `0.6`       | Depth scaling of the rings, 0–1.                     |
| `rotationSpeed`        | `number`        | `0.6`       | Rotation speed, 0–2.                                 |
| `particleDensity`      | `number`        | `0.7`       | Density of spiral particles, 0–1.                    |
| `glowIntensity`        | `number`        | `0.6`       | Rim brightness, 0–1.                                 |
| `activationEffect`     | `number`        | `0`         | Hover/click activation boost, 0–1.                   |
| `coreColor`            | `string`        | `deep blue` | Interior core colour.                                |
| `paused`               | `boolean`       | `false`     | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`      | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`    | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —           | Extra class on the root.                             |
| `style`                | `CSSProperties` | —           | Inline styles on the root.                           |

### DimensionalRiftScanner

Scanline sweep revealing a corrupted surface.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `scanSpeed`            | `number`        | `0.3`         | Scan sweep speed, 0 to 1.5.                          |
| `scanWidth`            | `number`        | `0.045`       | Scanline thickness, 0.005 to 0.3.                    |
| `corruption`           | `number`        | `0.4`         | Glitch intensity, 0 to 1.                            |
| `gridDensity`          | `number`        | `18`          | Surface grid density, 4 to 60.                       |
| `trailLength`          | `number`        | `0.18`        | Afterglow length above the scanline, 0 to 0.5.       |
| `scanColor`            | `string`        | `cyan`        | Scan colour.                                         |
| `baseColor`            | `string`        | `Coloxo blue` | Surface colour.                                      |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### EnergyVortex

Differential-rotation spiral with a hot core.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `particleCount`        | `number`        | `700`         | Particle count, 100–3000.                            |
| `rotationSpeed`        | `number`        | `0.8`         | Rotation speed, 0–2.                                 |
| `vortexIntensity`      | `number`        | `0.55`        | Inward pull, 0–1.                                    |
| `trailPersistence`     | `number`        | `0.75`        | Trail persistence, 0–1.                              |
| `particleSize`         | `number`        | `1.3`         | Particle radius in CSS pixels, 0.3–4.                |
| `color`                | `string`        | `Coloxo blue` | Primary colour.                                      |
| `accentColor`          | `string`        | `cyan`        | Secondary colour.                                    |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### ForceFieldMembrane

Energy barrier that ripples where the pointer presses.

| Prop                   | Type            | Default  | Description                                          |
| ---------------------- | --------------- | -------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —        | Content layered above the canvas.                    |
| `membraneRadius`       | `number`        | `0.8`    | Membrane sphere radius, 0.15–0.95.                   |
| `waveSpeed`            | `number`        | `1`      | Wave travel speed, 0.1–3.                            |
| `opacity`              | `number`        | `0.75`   | Peak opacity of the membrane, 0–1.                   |
| `distortionStrength`   | `number`        | `0.55`   | Deformation depth, 0–1.                              |
| `decay`                | `number`        | `0.5`    | How quickly disturbances settle, 0–1.                |
| `surfaceColor`         | `string`        | `cyan`   | Membrane colour.                                     |
| `paused`               | `boolean`       | `false`  | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`   | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium` | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —        | Extra class on the root.                             |
| `style`                | `CSSProperties` | —        | Inline styles on the root.                           |

### GenerativeRibbonField

Braided ribbons that bend toward the pointer.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `ribbonCount`          | `number`        | `14`          | Number of ribbons, 3–40.                             |
| `waveAmplitude`        | `number`        | `42`          | Wave amplitude in CSS pixels, 0–120.                 |
| `flowSpeed`            | `number`        | `0.6`         | Forward scroll speed, 0–2.                           |
| `ribbonThickness`      | `number`        | `1.6`         | Stroke width in CSS pixels, 0.5–8.                   |
| `pointerAttraction`    | `number`        | `0.5`         | How strongly ribbons bend toward the pointer, 0–1.   |
| `filled`               | `boolean`       | `false`       | Draw ribbons as filled bands rather than lines.      |
| `color`                | `string`        | `Coloxo blue` | Primary colour.                                      |
| `accentColor`          | `string`        | `cyan`        | Secondary colour.                                    |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### GravitationalLens

Spacetime well that bends the field behind it.

| Prop                   | Type            | Default              | Description                                                                |
| ---------------------- | --------------- | -------------------- | -------------------------------------------------------------------------- |
| `children`             | `ReactNode`     | —                    | Content layered above the canvas.                                          |
| `gravityStrength`      | `number`        | `0.6`                | Pull of each mass, 0–1.                                                    |
| `lensRadius`           | `number`        | `0.12`               | Edge length of the brightest core, in normalized units.                    |
| `centerPosition`       | `VisualPoint`   | `{ x: 0.5, y: 0.5 }` | Gravitational centre as normalized coordinates.                            |
| `trailLength`          | `number`        | `0.7`                | Persistence of the light streaks, 0–1.                                     |
| `color`                | `string`        | `Coloxo blue`        | Streak colour, any CSS colour.                                             |
| `massCount`            | `1 \| 2`        | `2`                  | Number of masses: `1` for a single well, `2` for an orbiting pair.         |
| `attract`              | `boolean`       | `true`               | Whether the paired mass attracts or pushes. Ignored when `massCount` is 1. |
| `paused`               | `boolean`       | `false`              | Render one static frame.                                                   |
| `respectReducedMotion` | `boolean`       | `true`               | Honour `prefers-reduced-motion` with a static frame.                       |
| `quality`              | `VisualQuality` | `medium`             | Renderer resolution cap: `low` · `medium` · `high`.                        |
| `className`            | `string`        | —                    | Extra class on the root.                                                   |
| `style`                | `CSSProperties` | —                    | Inline styles on the root.                                                 |

### GyroscopicCore

Nested 3D rings with depth-sorted occlusion.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `ringCount`            | `number`        | `4`           | Number of rings, 2–10.                               |
| `rotationSpeed`        | `number`        | `0.7`         | Rotation speed, 0–2.                                 |
| `lineWidth`            | `number`        | `1.2`         | Line width in CSS pixels, 0.5–4.                     |
| `precession`           | `boolean`       | `true`        | Whether rings precess on a second axis.              |
| `segments`             | `number`        | `72`          | Segments per ring, 24–160.                           |
| `color`                | `string`        | `Coloxo blue` | Primary ring colour.                                 |
| `accentColor`          | `string`        | `cyan`        | Alternate ring colour.                               |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### HolographicLiquidOrb

Iridescent oil-film sphere with cursor-reactive refraction.

| Prop                   | Type             | Default  | Description                                                         |
| ---------------------- | ---------------- | -------- | ------------------------------------------------------------------- |
| `children`             | `ReactNode`      | —        | Content layered above the canvas.                                   |
| `colorScheme`          | `OrbColorScheme` | —        | Base palette family. Defaults to `iridescent`.                      |
| `iridescence`          | `number`         | `0.85`   | Strength of the oil-film colour shift, 0–1.                         |
| `distortion`           | `number`         | `0.4`    | Surface wobble from the liquid simulation, 0–1.                     |
| `rotationSpeed`        | `number`         | `0.35`   | Idle spin in radians per second, 0–3.                               |
| `interactionStrength`  | `number`         | `0.6`    | How strongly the cursor displaces the surface, 0–1.                 |
| `scale`                | `number`         | `0.78`   | Orb radius as a fraction of the container's shorter side, 0.2–0.95. |
| `paused`               | `boolean`        | `false`  | Render one static frame.                                            |
| `respectReducedMotion` | `boolean`        | `true`   | Honour `prefers-reduced-motion`.                                    |
| `quality`              | `OrbQuality`     | `medium` | Renderer resolution cap.                                            |
| `className`            | `string`         | —        | Extra class on the root.                                            |
| `style`                | `CSSProperties`  | —        | Inline styles on the root.                                          |

### InteractiveFieldDistortion

Pointer-driven distortion field on a flowing surface.

| Prop                   | Type             | Default  | Description                                              |
| ---------------------- | ---------------- | -------- | -------------------------------------------------------- |
| `children`             | `ReactNode`      | —        | Content layered above the canvas.                        |
| `type`                 | `DistortionType` | `liquid` | Preset shape of the displacement.                        |
| `strength`             | `number`         | `0.6`    | Displacement magnitude, 0–1.                             |
| `radius`               | `number`         | `0.28`   | Radius of influence in normalized units, 0.05–0.8.       |
| `decay`                | `number`         | `0.4`    | How fast the field settles after the pointer moves, 0–1. |
| `blend`                | `number`         | `1`      | Blend between the undistorted and distorted scene, 0–1.  |
| `paused`               | `boolean`        | `false`  | Render one static frame.                                 |
| `respectReducedMotion` | `boolean`        | `true`   | Honour `prefers-reduced-motion` with a static frame.     |
| `quality`              | `VisualQuality`  | `medium` | Renderer resolution cap: `low` · `medium` · `high`.      |
| `className`            | `string`         | —        | Extra class on the root.                                 |
| `style`                | `CSSProperties`  | —        | Inline styles on the root.                               |

### InteractiveRippleField

Liquid surface with expanding pointer ripples.

| Prop                   | Type            | Default  | Description                                          |
| ---------------------- | --------------- | -------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —        | Content layered above the canvas.                    |
| `waveAmplitude`        | `number`        | `0.5`    | Crest height, 0–1.                                   |
| `waveSpeed`            | `number`        | `1`      | Propagation speed, 0.1–3.                            |
| `rippleFrequency`      | `number`        | `4`      | Ring frequency, 1–10.                                |
| `decay`                | `number`        | `0.4`    | How fast ripples fade with distance, 0–1.            |
| `mode`                 | `RippleMode`    | `water`  | Preset appearance.                                   |
| `distortion`           | `number`        | `0.5`    | Background distortion from passing waves, 0–1.       |
| `paused`               | `boolean`       | `false`  | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`   | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium` | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —        | Extra class on the root.                             |
| `style`                | `CSSProperties` | —        | Inline styles on the root.                           |

### KineticGridWarp

Perspective grid warped by waves and pointer gravity.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `gridSize`             | `number`        | `14`          | Grid cell count across the frame, 4 to 40.           |
| `warpStrength`         | `number`        | `1`           | Wave distortion strength, 0 to 3.                    |
| `speed`                | `number`        | `0.5`         | Scroll speed, 0 to 2.                                |
| `lineWidth`            | `number`        | `0.04`        | Line thickness, 0.005 to 0.2.                        |
| `perspective`          | `number`        | `1`           | Perspective squeeze toward the horizon, 0.2 to 2.    |
| `lineColor`            | `string`        | `Coloxo blue` | Line colour.                                         |
| `accentColor`          | `string`        | `cyan`        | Accent and pointer glow colour.                      |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### LiquidMetalMorph

Chrome surface morphing between geometric forms.

| Prop                   | Type            | Default  | Description                                           |
| ---------------------- | --------------- | -------- | ----------------------------------------------------- |
| `children`             | `ReactNode`     | —        | Content layered above the canvas.                     |
| `shape`                | `MetalShape`    | `torus`  | Target form.                                          |
| `morphSpeed`           | `number`        | `0.6`    | How far the morph has progressed toward `shape`, 0–1. |
| `metalness`            | `number`        | `0.9`    | Specular reflectivity, 0–1.                           |
| `roughness`            | `number`        | `0.15`   | Scatter of the reflection, 0–1.                       |
| `cursorInfluence`      | `number`        | `0.5`    | Pointer pull on the silhouette, 0–1.                  |
| `reflectionIntensity`  | `number`        | `1`      | Brightness of the environment reflection, 0–1.5.      |
| `paused`               | `boolean`       | `false`  | Render one static frame.                              |
| `respectReducedMotion` | `boolean`       | `true`   | Honour `prefers-reduced-motion` with a static frame.  |
| `quality`              | `VisualQuality` | `medium` | Renderer resolution cap: `low` · `medium` · `high`.   |
| `className`            | `string`        | —        | Extra class on the root.                              |
| `style`                | `CSSProperties` | —        | Inline styles on the root.                            |

### LivingWireframeTerrain

Endless procedural terrain rendered as a wireframe.

| Prop                   | Type            | Default       | Description                                              |
| ---------------------- | --------------- | ------------- | -------------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                        |
| `waveAmplitude`        | `number`        | `0.45`        | Terrain relief, 0–1.                                     |
| `noiseScale`           | `number`        | `1`           | Noise frequency. Lower values give broad hills, 0.3–3.   |
| `interactionRadius`    | `number`        | `0.22`        | Radius of the pointer-driven hill, 0.05–0.6.             |
| `cameraAngle`          | `number`        | `1`           | Camera pitch, 0.5–1.4.                                   |
| `wireframeColor`       | `string`        | `Coloxo blue` | Wire colour.                                             |
| `gridResolution`       | `number`        | `1`           | Grid resolution hint, 0.5–2. Higher draws a denser mesh. |
| `paused`               | `boolean`       | `false`       | Render one static frame.                                 |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame.     |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.      |
| `className`            | `string`        | —             | Extra class on the root.                                 |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                               |

### MagneticFieldVisualizer

Dipole field lines with polarity and density controls.

| Prop                   | Type                | Default   | Description                                          |
| ---------------------- | ------------------- | --------- | ---------------------------------------------------- |
| `children`             | `ReactNode`         | —         | Content layered above the canvas.                    |
| `poleCount`            | `2 \| 3`            | `2`       | Number of poles, 2–3.                                |
| `fieldStrength`        | `number`            | `0.6`     | Field line curvature strength, 0–1.                  |
| `lineDensity`          | `number`            | `4`       | Contour density, 1–8.                                |
| `particleSpeed`        | `number`            | `0.5`     | How fast the field advects, 0–1.                     |
| `polarity`             | `MagneticPolarity`  | `attract` | Pole orientation.                                    |
| `colorMode`            | `MagneticColorMode` | `brand`   | Colour mapping for the field.                        |
| `paused`               | `boolean`           | `false`   | Render one static frame.                             |
| `respectReducedMotion` | `boolean`           | `true`    | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality`     | `medium`  | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`            | —         | Extra class on the root.                             |
| `style`                | `CSSProperties`     | —         | Inline styles on the root.                           |

### ParametricSculpture

Depth-sorted wireframe of a parametric surface.

| Prop                   | Type               | Default               | Description                                           |
| ---------------------- | ------------------ | --------------------- | ----------------------------------------------------- |
| `children`             | `ReactNode`        | —                     | Content layered above the canvas.                     |
| `variant`              | `SculptureVariant` | `knot`                | Surface form.                                         |
| `resolution`           | `number`           | `depends on `quality` | Grid resolution, 8–48.                                |
| `deformation`          | `number`           | `0.5`                 | Deformation amount, 0–1.                              |
| `speed`                | `number`           | `0.6`                 | Animation speed, 0–2.                                 |
| `lineWidth`            | `number`           | `0.8`                 | Wireframe line width, 0.3–3.                          |
| `wireframe`            | `boolean`          | `true`                | Draw full wireframe instead of horizontal rings only. |
| `color`                | `string`           | `Coloxo blue`         | Primary colour.                                       |
| `accentColor`          | `string`           | `cyan`                | Secondary colour.                                     |
| `paused`               | `boolean`          | `false`               | Render one static frame.                              |
| `respectReducedMotion` | `boolean`          | `true`                | Honour `prefers-reduced-motion` with a static frame.  |
| `quality`              | `VisualQuality`    | `medium`              | Renderer resolution cap: `low` · `medium` · `high`.   |
| `className`            | `string`           | —                     | Extra class on the root.                              |
| `style`                | `CSSProperties`    | —                     | Inline styles on the root.                            |

### ParticleDisintegration

A body that scatters and reforms under drift physics.

| Prop                   | Type            | Default       | Description                                           |
| ---------------------- | --------------- | ------------- | ----------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                     |
| `particleCount`        | `number`        | `900`         | Particle count, 50–4000.                              |
| `disintegrateAmount`   | `number`        | `0.7`         | Scatter distance as a fraction of the container, 0–1. |
| `driftSpeed`           | `number`        | `0.5`         | Continuous drift speed, 0–2.                          |
| `particleSize`         | `number`        | `1.1`         | Particle radius in CSS pixels, 0.3–4.                 |
| `trailFade`            | `number`        | `0.6`         | Opacity of the motion trail, 0–1.                     |
| `color`                | `string`        | `Coloxo blue` | Particle colour.                                      |
| `accentColor`          | `string`        | `cyan`        | Outer glow colour.                                    |
| `paused`               | `boolean`       | `false`       | Render one static frame.                              |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame.  |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.   |
| `className`            | `string`        | —             | Extra class on the root.                              |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                            |

### ParticleShapeTransition

Particles morphing between sampled arrangements.

| Prop                   | Type            | Default       | Description                                           |
| ---------------------- | --------------- | ------------- | ----------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                     |
| `fromShape`            | `ParticleShape` | `ring`        | Starting arrangement.                                 |
| `toShape`              | `ParticleShape` | `spiral`      | Target arrangement.                                   |
| `progress`             | `number`        | `0.6`         | Transition progress toward `toShape`, 0–1.            |
| `particleCount`        | `number`        | `800`         | Particle count, 50–4000.                              |
| `particleSize`         | `number`        | `1.2`         | Particle radius in CSS pixels, 0.3–4.                 |
| `repelForce`           | `number`        | `24`          | How strongly the pointer pushes particles away, 0–60. |
| `color`                | `string`        | `Coloxo blue` | Particle colour.                                      |
| `paused`               | `boolean`       | `false`       | Render one static frame.                              |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame.  |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.   |
| `className`            | `string`        | —             | Extra class on the root.                              |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                            |

### ParticleTypography

Live text assembled from particles at runtime.

| Prop                   | Type            | Default  | Description                                          |
| ---------------------- | --------------- | -------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —        | Content layered above the canvas.                    |
| `text`                 | `string`        | `Coloxo` | Text the particles assemble into.                    |
| `particleCount`        | `number`        | `2200`   | Particle count, 200–8000.                            |
| `scatter`              | `number`        | `0`      | Dispersion from the glyph silhouette, 0–1.           |
| `repelForce`           | `number`        | `20`     | Pointer repulsion strength in pixels, 0–60.          |
| `fontFamily`           | `string`        | —        | Font stack used to rasterise the glyphs.             |
| `color`                | `string`        | `white`  | Particle colour.                                     |
| `paused`               | `boolean`       | `false`  | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`   | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium` | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —        | Extra class on the root.                             |
| `style`                | `CSSProperties` | —        | Inline styles on the root.                           |

### RefractionLens

Glass lens with chromatic edge dispersion.

| Prop                   | Type            | Default      | Description                                                         |
| ---------------------- | --------------- | ------------ | ------------------------------------------------------------------- |
| `children`             | `ReactNode`     | —            | Content layered above the canvas.                                   |
| `magnification`        | `number`        | `1.8`        | Content magnification inside the lens, 0.5–4.                       |
| `lensRadius`           | `number`        | `0.6`        | Lens diameter as a fraction of the container's shorter side, 0.1–1. |
| `refractionStrength`   | `number`        | `0.7`        | How strongly the lookup is bent, 0–1.                               |
| `chromaticAberration`  | `number`        | `0.35`       | Colour separation at the rim, 0–1.                                  |
| `edgeGlow`             | `number`        | `0.6`        | Brightness of the lit rim, 0–1.                                     |
| `tint`                 | `string`        | `near-white` | Tint multiplied over the refracted content.                         |
| `paused`               | `boolean`       | `false`      | Render one static frame.                                            |
| `respectReducedMotion` | `boolean`       | `true`       | Honour `prefers-reduced-motion` with a static frame.                |
| `quality`              | `VisualQuality` | `medium`     | Renderer resolution cap: `low` · `medium` · `high`.                 |
| `className`            | `string`        | —            | Extra class on the root.                                            |
| `style`                | `CSSProperties` | —            | Inline styles on the root.                                          |

### RefractiveGlassCube

Frosted glass volume with a refracted backdrop.

| Prop                   | Type            | Default       | Description                                           |
| ---------------------- | --------------- | ------------- | ----------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                     |
| `ior`                  | `number`        | `1.5`         | Index of refraction, 1–2.4.                           |
| `transmission`         | `number`        | `0.8`         | How much the background shows through the faces, 0–1. |
| `thickness`            | `number`        | `0.5`         | Apparent wall thickness, 0–1.                         |
| `roughness`            | `number`        | `0.08`        | Surface roughness, 0–1.                               |
| `rotationSensitivity`  | `number`        | `0.6`         | Pointer tilt response, 0–1.                           |
| `interiorColor`        | `string`        | `Coloxo blue` | Interior gradient colour.                             |
| `paused`               | `boolean`       | `false`       | Render one static frame.                              |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame.  |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.   |
| `className`            | `string`        | —             | Extra class on the root.                              |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                            |

### SelfDrawingGeometry

Shapes that draw along their own arc length.

| Prop                   | Type            | Default       | Description                                                         |
| ---------------------- | --------------- | ------------- | ------------------------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                                   |
| `shape`                | `GeometryShape` | `hexagon`     | Shape to draw.                                                      |
| `progress`             | `number`        | `0`           | Fixed draw progress, 0–1. `0` lets the shape draw itself on a loop. |
| `strokeWidth`          | `number`        | `1.6`         | Line width in CSS pixels, 0.5–6.                                    |
| `sides`                | `number`        | `6`           | Vertex count for polygonal shapes, 3–24.                            |
| `loop`                 | `boolean`       | `true`        | Whether the path continuously redraws.                              |
| `color`                | `string`        | `Coloxo blue` | Stroke colour.                                                      |
| `glowColor`            | `string`        | `cyan`        | Glow colour.                                                        |
| `paused`               | `boolean`       | `false`       | Render one static frame.                                            |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame.                |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.                 |
| `className`            | `string`        | —             | Extra class on the root.                                            |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                                          |

### SoftBodyPhysicsPlayground

Verlet cloth membrane you can push and drag.

| Prop                   | Type            | Default               | Description                                          |
| ---------------------- | --------------- | --------------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —                     | Content layered above the canvas.                    |
| `meshResolution`       | `number`        | `depends on `quality` | Grid points per side, 4–28.                          |
| `stiffness`            | `number`        | `0.7`                 | Spring stiffness, 0.1–1.                             |
| `gravity`              | `number`        | `1`                   | Gravity multiplier, 0–3.                             |
| `interactionRadius`    | `number`        | `70`                  | Pointer push radius in CSS pixels, 10–200.           |
| `damping`              | `number`        | `0.98`                | Velocity retention per step, 0.7–1.                  |
| `wireframe`            | `boolean`       | `true`                | Draw the mesh wireframe.                             |
| `color`                | `string`        | `Coloxo blue`         | Mesh colour.                                         |
| `accentColor`          | `string`        | `cyan`                | Node colour.                                         |
| `paused`               | `boolean`       | `false`               | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`                | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`              | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —                     | Extra class on the root.                             |
| `style`                | `CSSProperties` | —                     | Inline styles on the root.                           |

### SpatialGlassLayers

Translucent panes separated by parallax depth.

| Prop                   | Type            | Default       | Description                                           |
| ---------------------- | --------------- | ------------- | ----------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                     |
| `layerCount`           | `number`        | `5`           | Number of stacked panes, 2–12.                        |
| `parallaxStrength`     | `number`        | `0.6`         | Parallax response to the pointer, 0–1.                |
| `cornerRadius`         | `number`        | `0.12`        | Pane corner radius as a fraction of pane size, 0–0.5. |
| `color`                | `string`        | `Coloxo blue` | Edge colour.                                          |
| `accentColor`          | `string`        | `cyan`        | Highlight colour.                                     |
| `paused`               | `boolean`       | `false`       | Render one static frame.                              |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame.  |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.   |
| `className`            | `string`        | —             | Extra class on the root.                              |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                            |

### SpatialGlitchDistortion

Datamosh tearing driven by scan, burst, and pointer.

| Prop                   | Type                         | Default      | Description                                          |
| ---------------------- | ---------------------------- | ------------ | ---------------------------------------------------- |
| `children`             | `ReactNode`                  | —            | Content layered above the canvas.                    |
| `glitchIntensity`      | `number`                     | `0.4`        | Base glitch energy, 0–1.                             |
| `sliceCount`           | `number`                     | `20`         | Number of horizontal slices, 4–64.                   |
| `rgbShift`             | `number`                     | `0.5`        | RGB channel separation, 0–1.                         |
| `trigger`              | `GlitchTrigger`              | `hover`      | When the effect fires.                               |
| `orientation`          | `"horizontal" \| "vertical"` | `horizontal` | Slice direction.                                     |
| `paused`               | `boolean`                    | `false`      | Render one static frame.                             |
| `respectReducedMotion` | `boolean`                    | `true`       | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality`              | `medium`     | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`                     | —            | Extra class on the root.                             |
| `style`                | `CSSProperties`              | —            | Inline styles on the root.                           |

### SpatialObjectGallery

Orbiting 3D primitives with pointer focus.

| Prop                   | Type            | Default               | Description                                              |
| ---------------------- | --------------- | --------------------- | -------------------------------------------------------- |
| `children`             | `ReactNode`     | —                     | Content layered above the canvas.                        |
| `objects`              | `ObjectKind[]`  | `cube, sphere, torus` | Objects to place in the ring, in order.                  |
| `orbitSpeed`           | `number`        | `0.4`                 | Orbit speed, 0–1.5.                                      |
| `pointerParallax`      | `number`        | `0.8`                 | Pointer parallax strength, 0–2.                          |
| `lineWidth`            | `number`        | `1`                   | Edge width, 0.3–3.                                       |
| `highlightedIndex`     | `number`        | `-1`                  | Index of the object to keep highlighted, or -1 for none. |
| `color`                | `string`        | `Coloxo blue`         | Edge colour.                                             |
| `accentColor`          | `string`        | `cyan`                | Highlight colour.                                        |
| `paused`               | `boolean`       | `false`               | Render one static frame.                                 |
| `respectReducedMotion` | `boolean`       | `true`                | Honour `prefers-reduced-motion` with a static frame.     |
| `quality`              | `VisualQuality` | `medium`              | Renderer resolution cap: `low` · `medium` · `high`.      |
| `className`            | `string`        | —                     | Extra class on the root.                                 |
| `style`                | `CSSProperties` | —                     | Inline styles on the root.                               |

### SpringMotionTrails

Pointer trail driven by damped spring physics.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `trailLength`          | `number`        | `24`          | Number of trailing nodes, 4–80.                      |
| `stiffness`            | `number`        | `0.35`        | Spring stiffness, 0.05–1. Higher snaps faster.       |
| `damping`              | `number`        | `0.6`         | Damping, 0–1. Lower overshoots and wobbles.          |
| `nodeSize`             | `number`        | `2.4`         | Node radius in CSS pixels, 0.5–8.                    |
| `color`                | `string`        | `Coloxo blue` | Lead colour.                                         |
| `accentColor`          | `string`        | `cyan`        | Tail colour.                                         |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

### VolumetricLightTunnel

Infinite corridor of light with volumetric haze.

| Prop                   | Type            | Default       | Description                                          |
| ---------------------- | --------------- | ------------- | ---------------------------------------------------- |
| `children`             | `ReactNode`     | —             | Content layered above the canvas.                    |
| `beamCount`            | `number`        | `7`           | Number of radial beams, 3–16.                        |
| `depth`                | `number`        | `1.4`         | Apparent tunnel depth, 0.2–3.                        |
| `travelSpeed`          | `number`        | `0.8`         | Forward travel speed, 0–2.                           |
| `bloomStrength`        | `number`        | `0.5`         | Bloom strength, 0–1.                                 |
| `cameraMotion`         | `number`        | `0.5`         | How far the camera sways with the pointer, 0–1.      |
| `paletteA`             | `string`        | `Coloxo blue` | Near colour.                                         |
| `paletteB`             | `string`        | `cyan`        | Far colour.                                          |
| `paused`               | `boolean`       | `false`       | Render one static frame.                             |
| `respectReducedMotion` | `boolean`       | `true`        | Honour `prefers-reduced-motion` with a static frame. |
| `quality`              | `VisualQuality` | `medium`      | Renderer resolution cap: `low` · `medium` · `high`.  |
| `className`            | `string`        | —             | Extra class on the root.                             |
| `style`                | `CSSProperties` | —             | Inline styles on the root.                           |

---

### Visuals variant unions

Six exported constants list the allowed string values for the visual props that
take a preset. Use the constant instead of retyping the union.

| Constant                                                                    | Values                                                | Used by                                            |
| --------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| `DISTORTION_TYPES`                                                          | `liquid` · `heat-haze` · `wave` · `lens`              | `InteractiveFieldDistortion` (`type`)              |
| `RIPPLE_MODES`                                                              | `water` · `glass` · `energy`                          | `InteractiveRippleField` (`mode`)                  |
| `METAL_SHAPES`                                                              | `sphere` · `capsule` · `torus`                        | `LiquidMetalMorph` (`shape`)                       |
| `SCULPTURE_VARIANTS`                                                        | `knot` · `bottle` · `blob`                            | `ParametricSculpture` (`variant`)                  |
| `PARTICLE_SHAPES`                                                           | `ring` · `grid` · `spiral` · `wave` · `scatter`       | `ParticleShapeTransition` (`fromShape`, `toShape`) |
| `GEOMETRY_SHAPES`                                                           | `circle` · `triangle` · `hexagon` · `star` · `spiral` | `SelfDrawingGeometry` (`shape`)                    |
| Matching type exports: `DistortionType`, `RippleMode`, `MetalShape`,        |
| `SculptureVariant`, `ParticleShape`, `GeometryShape`. Related unions:       |
| `OrbColorScheme` (`iridescent`, `aurora`, `sunset`, `ocean`, `monochrome`), |
| `MagneticPolarity`, `MagneticColorMode`, `GlitchTrigger`, `ObjectKind`      |
| (`cube`, `sphere`, `torus`).                                                |

---

## Docs chrome

Components for building documentation and marketing shells.

### DocsHeader

Top app bar with brand, nav, search slot, and actions.

| Prop                       | Type                  | Description                                       |
| -------------------------- | --------------------- | ------------------------------------------------- |
| `logo`                     | `ReactNode`           | Brand logo                                        |
| `brandLabel` / `brandMeta` | `string`              | Brand name and meta line                          |
| `navItems`                 | `DocsHeaderNavItem[]` | `{ id, label, href?, active?, badge?, onClick? }` |
| `search`                   | `ReactNode`           | Search slot (e.g. `DocsSearch`)                   |
| `actions`                  | `ReactNode`           | Trailing actions                                  |
| `onMenuClick`              | `() => void`          | Shows a mobile menu button                        |

Type exports: `DocsHeaderProps`, `DocsHeaderNavItem`.

### DocsPageHeader

Page title block with breadcrumb, badges, and actions.

| Prop          | Type               | Description               |
| ------------- | ------------------ | ------------------------- |
| `breadcrumb`  | `BreadcrumbItem[]` | Trail above the title     |
| `title`       | `ReactNode`        | Page title (**required**) |
| `description` | `ReactNode`        | Supporting text           |
| `badges`      | `ReactNode`        | Badges next to the title  |
| `actions`     | `ReactNode`        | Trailing actions          |

Type export: `DocsPageHeaderProps`.

### DocsSidebar

Grouped navigation sidebar.

| Prop     | Type                 | Description        |
| -------- | -------------------- | ------------------ |
| `groups` | `DocsSidebarGroup[]` | `{ label, items }` |
| `footer` | `ReactNode`          | Footer slot        |

`DocsSidebarItem`: `{ id, label, href?, icon?, active?, onClick? }`. Type exports: `DocsSidebarProps`, `DocsSidebarGroup`, `DocsSidebarItem`.

### DocsSearch

Search field with an inline results dropdown.

| Prop          | Type                      | Default              | Description                          |
| ------------- | ------------------------- | -------------------- | ------------------------------------ |
| `value`       | `string`                  | **required**         | Query value                          |
| `onChange`    | `(value: string) => void` | **required**         | Query handler                        |
| `onSelect`    | `(id: string) => void`    | —                    | Result selection                     |
| `items`       | `DocsSearchItem[]`        | —                    | `{ id, label, description?, href? }` |
| `placeholder` | `string`                  | `Search components…` | Empty text                           |
| `hotkey`      | `ReactNode`               | —                    | Trailing hotkey badge                |

Type exports: `DocsSearchProps`, `DocsSearchItem`.

### DocsToc

On-this-page table of contents.

| Prop     | Type            | Default        | Description                    |
| -------- | --------------- | -------------- | ------------------------------ |
| `items`  | `DocsTocItem[]` | **required**   | `{ id, label, href, active? }` |
| `title`  | `string`        | `On this page` | Heading                        |
| `footer` | `ReactNode`     | —              | Footer slot                    |

Type exports: `DocsTocProps`, `DocsTocItem`.

### ThemeToggle

Segmented Light / Dark / System control wired to `useTheme()`. Must be used within `ThemeProvider`.

| Prop        | Type     | Description |
| ----------- | -------- | ----------- |
| `className` | `string` | Extra class |

Type export: `ThemeToggleProps`.

### AnnouncementBar

Slim banner with content and an optional trailing slot. Renders `role="status"`.

| Prop       | Type        | Description                 |
| ---------- | ----------- | --------------------------- |
| `children` | `ReactNode` | Message (**required**)      |
| `trailing` | `ReactNode` | Trailing slot (e.g. a link) |

Accepts native `<div>` attributes (except `children`). Type export: `AnnouncementBarProps`.

### CodeBlock

Self-contained code display with built-in token syntax highlighting (no Prism/Shiki/Highlight.js), line numbers, copy, highlight/focus lines, and documentation chrome.

| Prop                                    | Type                            | Default      | Description                                                                |
| --------------------------------------- | ------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `code`                                  | `string`                        | **required** | Raw source (also clipboard payload)                                        |
| `language`                              | `CodeLanguage`                  | `plaintext`  | Grammar id                                                                 |
| `languageLabel` / `label` / `filename`  | `string`                        | —            | Header labels                                                              |
| `variant`                               | `CodeBlockVariant`              | `default`    | `default` · `minimal` · `compact` · `borderless` · `elevated` · `terminal` |
| `theme`                                 | `"light" \| "dark" \| "system"` | `system`     | Forced or inherited theme                                                  |
| `showLineNumbers`                       | `boolean`                       | `false`      | Auto line numbers (incl. blanks)                                           |
| `startLine`                             | `number`                        | `1`          | First displayed number                                                     |
| `highlightLines` / `focusLines`         | `number[]`                      | —            | Row emphasis / mute others                                                 |
| `showCopyButton`                        | `boolean`                       | `true`       | Copy control                                                               |
| `wordWrap`                              | `boolean`                       | `false`      | Wrap vs horizontal scroll                                                  |
| `maxHeight` / `maxLines` / `expandable` | —                               | —            | Overflow + collapse                                                        |

Type exports: `CodeBlockProps`, `CodeLanguage`, `CodeTheme`, `CodeBlockVariant`.

```tsx
<CodeBlock language="typescript" filename="user.ts" showLineNumbers code={code} />
```

### Terminal

Visual terminal/console session for documentation (prompts, commands, output, status, cursor, chrome). Display-only — does not execute shell commands. Separate from CodeBlock.

| Prop                                              | Type                            | Default       | Description                                                        |
| ------------------------------------------------- | ------------------------------- | ------------- | ------------------------------------------------------------------ |
| `commands`                                        | `TerminalCommand[]`             | —             | Structured session (`command`, `output?`, `status?`)               |
| `content`                                         | `string`                        | —             | Raw body when not using `commands`                                 |
| `shell`                                           | `TerminalShell`                 | `bash`        | `bash` · `zsh` · `powershell` · `cmd` · `fish` · `sh` · `terminal` |
| `shellLabel` / `title` / `cwd`                    | `string`                        | —             | Header / path labels                                               |
| `variant`                                         | `TerminalVariant`               | `default`     | `default` · `minimal` · `window` · `inline`                        |
| `theme`                                           | `"light" \| "dark" \| "system"` | `dark`        | Dark by default                                                    |
| `showWindowControls` / `showShell` / `showPrompt` | `boolean`                       | `true`        | Chrome toggles                                                     |
| `prompt`                                          | `string`                        | shell default | Override prompt                                                    |
| `showCursor` / `cursor` / `cursorBlink`           | —                               | block / true  | Idle cursor                                                        |
| `showCopyButton`                                  | `boolean`                       | `false`       | Copies commands only (no prompts)                                  |
| `maxHeight` / `scrollable` / `selectable`         | —                               | —             | Body behavior                                                      |
| `padding` / `fontSize`                            | `"sm" \| "md" \| "lg"`          | `md`          | Density                                                            |

Type exports: `TerminalProps`, `TerminalCommand`, `TerminalShell`, `TerminalStatus`, `TerminalVariant`, `TerminalTheme`.

```tsx
<Terminal
  shell="bash"
  showCopyButton
  commands={[{ command: "npm install @coloxo/ui" }, { command: "npx coloxo add terminal" }]}
/>
```

### Kbd

Keyboard key styling.

| Prop       | Type        | Description              |
| ---------- | ----------- | ------------------------ |
| `children` | `ReactNode` | Key label (**required**) |

Accepts native `<span>` attributes. Type export: `KbdProps`.

```tsx
<Kbd>⌘</Kbd> <Kbd>K</Kbd>
```

---

## Component index

### General, forms, feedback, data, navigation

- [Accordion](#accordion)
- [Alert](#alert)
- [AnnouncementBar](#announcementbar)
- [Avatar](#avatar)
- [AvatarCompanyIcon](#avatarcompanyicon)
- [AvatarGroup](#avatargroup)
- [AvatarLabelGroup](#avatarlabelgroup)
- [AvatarProfilePhoto](#avatarprofilephoto)
- [Badge](#badge)
- [BarChart](#barchart)
- [Breadcrumb](#breadcrumb)
- [Button](#button)
- [ButtonGroup](#buttongroup)
- [Card](#card)
- [ChartTooltip](#charttooltip)
- [Checkbox](#checkbox)
- [CodeBlock](#codeblock)
- [ColorPicker](#colorpicker)
- [Combobox](#combobox)
- [DataTable](#datatable)
- [DatePicker](#datepicker)
- [Divider](#divider)
- [DocsHeader](#docsheader)
- [DocsPageHeader](#docspageheader)
- [DocsSearch](#docssearch)
- [DocsSidebar](#docssidebar)
- [DocsToc](#docstoc)
- [Drawer](#drawer)
- [Dropdown](#dropdown)
- [EmptyState](#emptystate)
- [FeaturedIcon](#featuredicon)
- [FileListItem](#filelistitem)
- [FileTypeIcon](#filetypeicon)
- [FileUpload](#fileupload)
- [FormField](#formfield)
- [GradientPicker](#gradientpicker)
- [Heading](#heading)
- [Icon](#icon)
- [IconButton](#iconbutton)
- [Input](#input)
- [InputGroup](#inputgroup)
- [InputOTP](#inputotp)
- [InputPrefix](#inputprefix)
- [Kbd](#kbd)
- [Label](#label)
- [Modal](#modal)
- [Notification](#notification)
- [Pagination](#pagination)
- [PieChart](#piechart)
- [ProgressBar](#progressbar)
- [Radio](#radio--radiogroup)
- [RadioGroup](#radio--radiogroup)
- [RangePicker](#rangepicker)
- [Select](#select)
- [Skeleton](#skeleton)
- [Statistic](#statistic)
- [Switch](#switch)
- [Table](#table)
- [Tabs](#tabs)
- [Tag](#tag)
- [Terminal](#terminal)
- [Text](#text)
- [Textarea](#textarea)
- [ThemeProvider](#themeprovider)
- [ThemeToggle](#themetoggle)
- [TimePicker](#timepicker)
- [Toggle](#toggle)
- [ToggleGroup](#togglegroup--togglegroupitem)
- [Togglegroupitem](#togglegroup--togglegroupitem)
- [Tooltip](#tooltip)

### Visuals

- [FluidBackground](#fluidbackground)
- [Vortex](#vortex)
- [WaveBackground](#wavebackground)
- [OrbitingPlanets](#orbitingplanets)
- [AuroraMeshGradient](#aurorameshgradient)
- [BioluminescentParticles](#bioluminescentparticles)
- [ChromaticAberrationText](#chromaticaberrationtext)
- [DimensionalPortal](#dimensionalportal)
- [DimensionalRiftScanner](#dimensionalriftscanner)
- [EnergyVortex](#energyvortex)
- [ForceFieldMembrane](#forcefieldmembrane)
- [GenerativeRibbonField](#generativeribbonfield)
- [GravitationalLens](#gravitationallens)
- [GyroscopicCore](#gyroscopiccore)
- [HolographicLiquidOrb](#holographicliquidorb)
- [InteractiveFieldDistortion](#interactivefielddistortion)
- [InteractiveRippleField](#interactiveripplefield)
- [KineticGridWarp](#kineticgridwarp)
- [LiquidMetalMorph](#liquidmetalmorph)
- [LivingWireframeTerrain](#livingwireframeterrain)
- [MagneticFieldVisualizer](#magneticfieldvisualizer)
- [ParametricSculpture](#parametricsculpture)
- [ParticleDisintegration](#particledisintegration)
- [ParticleShapeTransition](#particleshapetransition)
- [ParticleTypography](#particletypography)
- [RefractionLens](#refractionlens)
- [RefractiveGlassCube](#refractiveglasscube)
- [SelfDrawingGeometry](#selfdrawinggeometry)
- [SoftBodyPhysicsPlayground](#softbodyphysicsplayground)
- [SpatialGlassLayers](#spatialglasslayers)
- [SpatialGlitchDistortion](#spatialglitchdistortion)
- [SpatialObjectGallery](#spatialobjectgallery)
- [SpringMotionTrails](#springmotiontrails)
- [VolumetricLightTunnel](#volumetriclighttunnel)

### Tokens

- [tokens](#brand--design-tokens) · `Tokens` · `ColorToken`

---

_Generated from the public API of `@coloxo/ui`. Types export with each component (for example `ButtonVariant`, `BadgeType`, `AlertType`)._
