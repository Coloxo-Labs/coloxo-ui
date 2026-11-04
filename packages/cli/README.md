<p align="center">
  <img src="https://ui.coloxolabs.com/coloxo-ui-banner.jpg" alt="Coloxo UI" />
</p>

# coloxo

**Premium Coloxo UI — copy components into your project and own every line.**

The Coloxo CLI installs React components from the public registry the way shadcn does: source files land in *your* repo so you can edit freely. Pair it with [`@coloxo/ui`](https://www.npmjs.com/package/@coloxo/ui) or use copy-source alone.

[Docs](https://ui.coloxolabs.com/docs/getting-started) · [Components](https://ui.coloxolabs.com/components) · [GitHub](https://github.com/Coloxo-Labs/coloxo-ui)

## Quick start

```bash
npx coloxo init
npx coloxo add button
```

Pick a style once — it is stored in `coloxo.json`:

```bash
npx coloxo init --style coloxo-css   # CSS Modules + design tokens
npx coloxo init --style tailwind     # Flat TSX with utility classes
```

Then add what you need:

```bash
npx coloxo add button
npx coloxo add select modal data-table
npx coloxo list
```

## Styles

| Style | What you get |
|---|---|
| `coloxo-css` | CSS Modules + `--cx-*` tokens. No Tailwind config required. |
| `tailwind` | Self-contained TSX with utilities inlined. Ideal if you already use Tailwind. |

Same component API in both modes. Of **92** registry entries, **54** ship both styles.

## Commands

| Command | Description |
|---|---|
| `coloxo init` | Create `coloxo.json` and install foundation (styles, utils, theme) |
| `coloxo add <slug…>` | Copy components (and dependencies) into your project |
| `coloxo list` | Show available registry components |

### Useful flags

```bash
coloxo init --yes --style tailwind
coloxo add button --overwrite
coloxo add button --registry https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/registry/registry.json
```

## Registry

By default the CLI reads the public Coloxo registry on GitHub:

- Manifest: `https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/registry/registry.json`
- Sources: `https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/<path>`

Override with `--registry`, `coloxo.json` (`registry`, `registryContentBase`), or:

- `COLOXO_REGISTRY_DIR` / `COLOXO_REGISTRY_PATH`
- `COLOXO_REGISTRY_CONTENT_BASE`

## Requirements

- Node.js ≥ 20
- A React project (Next.js, Vite, and similar)

## License

MIT © [Coloxo Labs](https://github.com/Coloxo-Labs)
