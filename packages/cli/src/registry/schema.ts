import { z } from "zod";

export const PropDocSchema = z.object({
  name: z.string(),
  type: z.string(),
  defaultValue: z.string().optional(),
  description: z.string(),
});

export const CategorySchema = z.enum([
  "Foundation",
  "General",
  "Forms",
  "Feedback",
  "Data Display",
  "Chart",
  "Navigation",
  "Date & File",
]);

export const StatusSchema = z.enum(["experimental", "beta", "stable", "deprecated"]);

export const RegistryTypeSchema = z.enum([
  "registry:ui",
  "registry:lib",
  "registry:style",
  "registry:theme",
]);

/** Styling modes a component can be distributed in. */
export const StyleModeSchema = z.enum(["tailwind", "coloxo-css"]);
export const RegistryFileSchema = z.object({
  path: z.string().min(1),
  target: z.string().min(1),
});

/** Per-style file list. Every target is explicit; the CLI never infers a path. */
export const StyleEntrySchema = z.object({
  files: z.array(RegistryFileSchema).min(1),
  dependencies: z.array(z.string()).default([]),
  registryDependencies: z.array(z.string()).default([]),
  cssImports: z.array(z.string()).optional(),
  docs: z
    .object({ usage: z.string().optional() })
    .optional(),
});
export const AccessibilitySchema = z.object({
  keyboard: z.boolean().optional(),
  aria: z.boolean().optional(),
  notes: z.string().optional(),
});

export const RegistryItemSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: RegistryTypeSchema,
    category: CategorySchema.optional(),
    description: z.string(),
    status: StatusSchema.default("stable"),
    version: z.string().default("1.0.0"),
    /**
     * Legacy single-mode file list. Kept so existing manifests stay valid while
     * the registry migrates to per-style entries.
     */
    files: z.array(RegistryFileSchema).min(1).optional(),
    /** Per-style distribution. Takes precedence over top-level iles. */
    styles: z
      .object({
        tailwind: StyleEntrySchema.optional(),
        "coloxo-css": StyleEntrySchema.optional(),
      })
      .optional(),
    dependencies: z.array(z.string()).default([]),
    registryDependencies: z.array(z.string()).default([]),
    cssImports: z.array(z.string()).optional(),
    providers: z.array(z.enum(["theme", "notification"])).optional(),
    accessibility: AccessibilitySchema.optional(),
    docs: z
      .object({
        usage: z.string().optional(),
        props: z.array(PropDocSchema).optional(),
      })
      .optional(),
  })
  .strict()
  .refine((item) => Boolean(item.files) || Boolean(item.styles), {
    message: "Item must declare either iles or styles",
  });
export const RegistrySchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  version: z.string(),
  items: z.array(RegistryItemSchema),
});

export type RegistryItem = z.infer<typeof RegistryItemSchema>;
export type RegistryFile = z.infer<typeof RegistryFileSchema>;
export type StyleMode = z.infer<typeof StyleModeSchema>;
export type StyleEntry = z.infer<typeof StyleEntrySchema>;
export type Registry = z.infer<typeof RegistrySchema>;
