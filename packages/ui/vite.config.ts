import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/test/**",
        // Docs/CLI visuals stay in source; keep them out of the published types.
        "src/visuals.ts",
        "src/components/Visuals/**",
        "src/components/FluidBackground/**",
        "src/components/Vortex/**",
        "src/components/WaveBackground/**",
        "src/components/OrbitingPlanets/**",
        "src/components/_internal/visuals/**",
      ],
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
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "ColoxoUI",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "clsx",
        "lucide-react",
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
