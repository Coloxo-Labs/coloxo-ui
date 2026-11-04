<p align="center">
  <img src="https://ui.coloxolabs.com/coloxo-ui-banner.jpg" alt="Coloxo UI" />
</p>

# @coloxo/ui

**Premium React interfaces. Built your way.**

A premium component library with accessible primitives, design tokens, and dual styling — install the package, or copy the source with the [Coloxo CLI](https://www.npmjs.com/package/@coloxo/cli).

[Documentation](https://ui.coloxolabs.com) · [Components](https://ui.coloxolabs.com/components) · [GitHub](https://github.com/Coloxo-Labs/coloxo-ui)

## Why Coloxo

- **Accessible by default** — keyboard, focus rings, and sensible ARIA
- **Design tokens** — brand once with `--cx-*` variables; light & dark themes
- **CSS Modules** — hashed classes, no global bleed, no Tailwind required
- **Typed end to end** — first-class TypeScript props and exports
- **Own the source** — optional copy-paste install via `npx coloxo add`

## Install

```bash
npm install @coloxo/ui
# or
pnpm add @coloxo/ui
# or
yarn add @coloxo/ui
```

Peer dependencies: `react` and `react-dom` ≥ 18.

```tsx
import { Button, ThemeProvider, NotificationProvider } from "@coloxo/ui";
import "@coloxo/ui/styles.css";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <NotificationProvider>{children}</NotificationProvider>
    </ThemeProvider>
  );
}
```

Shader and canvas visuals are optional in v1.0.6. Import them from the package:

```tsx
import { WaveBackground, AuroraMeshGradient } from "@coloxo/ui/visuals";
import "@coloxo/ui/styles.css";
```

Or copy one effect. This works in a Tailwind project and in a Coloxo CSS project. `coloxo init` does not install visuals.

```bash
npx coloxo add vortex
```

That copies the effect into your project and adds `@coloxo/ui` to `package.json`.

Works with Next.js, Vite, Remix, and other React apps.

## Quick start

```tsx
import { Button, Card, Badge, Input } from "@coloxo/ui";

export function Example() {
  return (
    <Card title="Welcome">
      <Badge type="pill-color" color="brand" size="sm">
        New
      </Badge>
      <Input label="Email" placeholder="you@company.com" />
      <Button>Continue</Button>
    </Card>
  );
}
```

All public APIs import from the package root:

```tsx
import { Button, Modal, DataTable, ThemeProvider } from "@coloxo/ui";
```

## Theming

Themes resolve through `[data-cx-theme="light|dark"]` and CSS variables.

```tsx
<ThemeProvider defaultTheme="system" tokens={{ color: { primary: "#2348FF" } }}>
  {children}
</ThemeProvider>
```

Override `--cx-*` in your app to evolve the look without rewriting components.

```ts
import { tokens } from "@coloxo/ui";
```

## Copy source instead

Prefer owning the files in your repo?

```bash
npx coloxo init
npx coloxo add button
```

Choose **Coloxo CSS** (CSS Modules + tokens) or **Tailwind** at init. Same component API either way.

## What’s included

Buttons, forms, feedback, navigation, data display, charts, file & date pickers, docs chrome, and visual backgrounds — see the [full API reference](https://github.com/Coloxo-Labs/coloxo-ui/blob/main/COMPONENTS.md) and the [live gallery](https://ui.coloxolabs.com/components).

## Browser support

Latest two versions of Chrome, Edge, Firefox, and Safari.

## License

MIT © [Coloxo Labs](https://github.com/Coloxo-Labs)
