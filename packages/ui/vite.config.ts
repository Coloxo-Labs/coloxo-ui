import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"],
      insertTypesEntry: true,
    }),
  ],
  css: {
    modules: {
      generateScopedName: "cx_[local]__[hash:base64:5]",
    },
  },
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        visuals: fileURLToPath(new URL("./src/visuals.ts", import.meta.url)),
      },
      name: "ColoxoUI",
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "clsx",
        "date-fns",
        "react-day-picker",
        /^@radix-ui\//,
        "@tanstack/react-table",
        "react-aria-components",
        /^react-aria-components\//,
      ],
      output: {
        // Next.js App Router needs this on the published entry; Vite/Rollup
        // otherwise strip the directive from src/index.ts during bundling.
        banner: '"use client";\n',
        assetFileNames: "styles.css",
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
