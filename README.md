<p align="center">
  <img src="https://ui.coloxolabs.com/coloxo-ui-banner.jpg" alt="Coloxo UI" />
</p>

<p align="center">
  <strong>Coloxo UI</strong><br />
  Premium interfaces. Built your way.
</p>

<p align="center">
  Accessible React components · Design tokens · CSS Modules <em>or</em> Tailwind<br />
  Install the package — or copy the source and own it.
</p>

<p align="center">
  <a href="https://ui.coloxolabs.com">Documentation</a> ·
  <a href="https://ui.coloxolabs.com/components">Components</a> ·
  <a href="https://ui.coloxolabs.com/blocks">Blocks</a> ·
  <a href="https://www.npmjs.com/package/@coloxo/ui">npm</a>
</p>

---

## Install in 30 seconds

**Option A — package**

```bash
npm install @coloxo/ui
```

```tsx
import { Button, ThemeProvider } from "@coloxo/ui";
import "@coloxo/ui/styles.css";

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Button>Ship it</Button>
    </ThemeProvider>
  );
}
```

**Option B — copy source**

```bash
npx coloxo init
npx coloxo add button
```

Choose **Coloxo CSS** or **Tailwind** at init. Same API. Your files.

Visuals stay optional. Add one when you want it. v1.0.6 installs that Coloxo CSS effect in either style and adds `@coloxo/ui` to `package.json`.

```bash
npx coloxo add vortex
```

## Highlights

|                  |                                                               |
| ---------------- | ------------------------------------------------------------- |
| **Accessible**   | Keyboard-first patterns, focus-visible, ARIA where it matters |
| **Token-driven** | `--cx-*` variables for color, type, space, radius, motion     |
| **Dual style**   | CSS Modules _or_ Tailwind — pick once, stay consistent        |
| **Typed**        | Full TypeScript surfaces, no `any` in the public API          |
| **Composable**   | Forms, feedback, data, charts, navigation, visuals            |

## Dual styles

| Style        | Best when                   | Output                  |
| ------------ | --------------------------- | ----------------------- |
| `coloxo-css` | You want tokens & isolation | CSS Modules + `--cx-*`  |
| `tailwind`   | You already run Tailwind    | Flat TSX with utilities |

```bash
npx coloxo init --style coloxo-css
npx coloxo init --style tailwind
```

**60** installable components · **54** available in both styles.

## Packages

| Package                       | What it is                                      |
| ----------------------------- | ----------------------------------------------- |
| [`@coloxo/ui`](./packages/ui) | React component library (npm)                   |
| [`coloxo`](./packages/cli)    | Copy-source CLI (`init` / `add` / `list`)       |
| [`registry/`](./registry)     | Free install manifests & Tailwind style sources |

Full prop reference: [COMPONENTS.md](./COMPONENTS.md).

## Contributing

We welcome issues and PRs. Start with [CONTRIBUTING.md](./CONTRIBUTING.md) and the issue templates under **New issue**.

```bash
npm install
npm run build
npm test
npm run registry:validate
```

## License

MIT © [Coloxo Labs](https://github.com/Coloxo-Labs)
