# Contributing to Coloxo UI

Thanks for helping improve Coloxo. This repository ships **`@coloxo/ui`**, the **`coloxo`** CLI, and the public **registry**.

## Source of truth

Component implementations live in **`packages/ui`**. Registry manifests point at those files — do not duplicate component source elsewhere.

When you add or change a component:

1. Implement or update it under `packages/ui/src/components/`.
2. Add or update a manifest at `registry/components/<slug>.json` (or `registry/base/` for shared primitives).
3. Declare every source file in the manifest `files` array (`path` = repo-relative, `target` = consumer install path).
4. List `registryDependencies` for other registry items the component needs.
5. Prefer design tokens (`--cx-*`); do not hard-code one-off values.
6. Keep Tailwind out of `packages/ui` (Tailwind ports belong under `registry/styles/`).

## Registry

Before opening a PR:

```bash
pnpm registry:build
pnpm registry:validate
```

These assemble `registry/registry.json`, verify files exist, check the dependency graph, and enforce required base items (`styles`, `utils`, `theme`).

## Tests

- Add or update Vitest tests next to components in `packages/ui` (`*.test.tsx`).
- Run `pnpm test` from the repo root.
- CLI changes under `packages/cli` should include tests for non-trivial behavior (`pnpm test:cli`).

## CLI

End users install with:

```bash
npx coloxo init
npx coloxo add <slug>
```

When changing install paths, transforms, or schema, update the CLI and manifests together so `coloxo add` stays in sync with `packages/ui`.

## Local setup

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

## Issues

Use the templates under **New issue**:

| Template | Use for |
|---|---|
| Bug report | Broken component, theme, or docs behavior |
| Feature request | New API, component, or enhancement |
| Documentation | Docs / `COMPONENTS.md` / copy fixes |
| CLI / registry | `coloxo init` / `add`, manifests, install paths |

Security issues: use [private advisories](https://github.com/Coloxo-Labs/coloxo-ui/security/advisories/new), not a public issue.

## Pull requests

- Keep changes focused; match existing patterns (CSS Modules, tokens, naming).
- Ensure CI passes: registry build/validate, typecheck, unit tests, and package builds.
- Link the related issue when one exists.
