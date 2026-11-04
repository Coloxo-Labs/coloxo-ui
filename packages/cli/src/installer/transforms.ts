import type { ColoxoConfig } from "../project/config.js";
import type { RegistryItem } from "../registry/schema.js";

export type TransformContext = {
  config: ColoxoConfig;
  items: RegistryItem[];
  /** Same-folder basename renames: Source.tsx → target.tsx */
  siblingRenames?: Record<string, string>;
};

/** Known component folder → consumer import subpath (kebab-case). */
const COMPONENT_IMPORT_MAP: Record<string, string> = {
  Icon: "icon/icon",
  FormField: "form-field/form-field",
  Label: "label/label",
  Tooltip: "tooltip/tooltip",
  Button: "button/button",
  Badge: "badge/badge",
  Input: "input/input",
  InputOTP: "input-otp/input-otp",
  Slider: "slider/slider",
  IconButton: "icon-button/icon-button",
  Modal: "modal/modal",
  Select: "select/select",
  DatePicker: "date-picker/date-picker",
  Divider: "divider/divider",
  Skeleton: "skeleton/skeleton",
  Kbd: "kbd/kbd",
  ProgressBar: "progress-bar/progress-bar",
  Checkbox: "checkbox/checkbox",
  Switch: "switch/switch",
  Radio: "radio/radio",
  Textarea: "textarea/textarea",
  Alert: "alert/alert",
  Drawer: "drawer/drawer",
  Tabs: "tabs/tabs",
  Breadcrumb: "breadcrumb/breadcrumb",
  EmptyState: "empty-state/empty-state",
  Pagination: "pagination/pagination",
  Dropdown: "dropdown/dropdown",
  Tag: "tag/tag",
  FeaturedIcon: "featured-icon/featured-icon",
  ButtonGroup: "button-group/button-group",
  Statistic: "statistic/statistic",
  Card: "card/card",
  Avatar: "avatar/avatar",
  Notification: "notification/notification",
  Table: "table/table",
  FileUpload: "file-upload/file-upload",
  ColorPicker: "color-picker/color-picker",
  DataTable: "data-table/data-table",
  Toggle: "toggle/toggle",
  AvatarGroup: "avatar-group/avatar-group",
  DocsHeader: "docs-header/docs-header",
  Typography: "typography/typography",
  CodeBlock: "code-block/code-block",
  Terminal: "terminal/terminal",
  FluidBackground: "fluid-background/fluid-background",
  Vortex: "vortex/vortex",
  WaveBackground: "wave-background/wave-background",
  OrbitingPlanets: "orbiting-planets/orbiting-planets",
  AuroraMeshGradient: "aurora-mesh-gradient/aurora-mesh-gradient",
  BioluminescentParticles: "bioluminescent-particles/bioluminescent-particles",
  ChromaticAberrationText: "chromatic-aberration-text/chromatic-aberration-text",
  DimensionalPortal: "dimensional-portal/dimensional-portal",
  DimensionalRiftScanner: "dimensional-rift-scanner/dimensional-rift-scanner",
  EnergyVortex: "energy-vortex/energy-vortex",
  ForceFieldMembrane: "force-field-membrane/force-field-membrane",
  GenerativeRibbonField: "generative-ribbon-field/generative-ribbon-field",
  GravitationalLens: "gravitational-lens/gravitational-lens",
  GyroscopicCore: "gyroscopic-core/gyroscopic-core",
  HolographicLiquidOrb: "holographic-liquid-orb/holographic-liquid-orb",
  InteractiveFieldDistortion: "interactive-field-distortion/interactive-field-distortion",
  InteractiveRippleField: "interactive-ripple-field/interactive-ripple-field",
  KineticGridWarp: "kinetic-grid-warp/kinetic-grid-warp",
  LiquidMetalMorph: "liquid-metal-morph/liquid-metal-morph",
  LivingWireframeTerrain: "living-wireframe-terrain/living-wireframe-terrain",
  MagneticFieldVisualizer: "magnetic-field-visualizer/magnetic-field-visualizer",
  ParametricSculpture: "parametric-sculpture/parametric-sculpture",
  ParticleDisintegration: "particle-disintegration/particle-disintegration",
  ParticleShapeTransition: "particle-shape-transition/particle-shape-transition",
  ParticleTypography: "particle-typography/particle-typography",
  RefractionLens: "refraction-lens/refraction-lens",
  RefractiveGlassCube: "refractive-glass-cube/refractive-glass-cube",
  SelfDrawingGeometry: "self-drawing-geometry/self-drawing-geometry",
  SoftBodyPhysicsPlayground: "soft-body-physics/soft-body-physics",
  SpatialGlassLayers: "spatial-glass-layers/spatial-glass-layers",
  SpatialGlitchDistortion: "spatial-glitch-distortion/spatial-glitch-distortion",
  SpatialObjectGallery: "spatial-object-gallery/spatial-object-gallery",
  SpringMotionTrails: "spring-motion-trails/spring-motion-trails",
  VolumetricLightTunnel: "volumetric-light-tunnel/volumetric-light-tunnel",
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function transformFileContent(
  content: string,
  sourcePath: string,
  ctx: TransformContext,
): string {
  const { config } = ctx;
  const utils = config.aliases.utils.replace(/\/$/, "");
  const styles = config.aliases.styles.replace(/\/$/, "");
  const components = config.aliases.components.replace(/\/$/, "");

  let out = content;

  // Block runtime imports of @coloxo/ui (comments mentioning the package name are fine)
  if (/from\s+["']@coloxo\/ui(?:\/[^"']*)?["']|import\s+["']@coloxo\/ui(?:\/[^"']*)?["']/.test(out)) {
    throw new Error(`Source ${sourcePath} imports @coloxo/ui; registry sources must use relative paths.`);
  }

  const utilsPatterns = [
    /from\s+["'](?:\.\.\/)+utils\/cx["']/g,
    /from\s+["'](?:\.\.\/)+utils\/useId["']/g,
    /from\s+["'](?:\.\.\/)+utils\/useControllableState["']/g,
    /import\s+["'](?:\.\.\/)+styles\/tokens\.css["']/g,
    /import\s+["'](?:\.\.\/)+styles\/primitives\.css["']/g,
  ];

  out = out.replace(utilsPatterns[0], `from "${utils}"`);
  out = out.replace(utilsPatterns[1], `from "${utils}"`);
  out = out.replace(utilsPatterns[2], `from "${utils}"`);
  out = out.replace(
    /import\s+["'](?:\.\.\/)+styles\/tokens\.css["']/g,
    `import "${styles}/coloxo-tokens.css"`,
  );
  out = out.replace(
    /import\s+["'](?:\.\.\/)+styles\/primitives\.css["']/g,
    `import "${styles}/coloxo-primitives.css"`,
  );

  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/Control\.module\.css["']/g,
    `from "${components}/form-control/control.module.css"`,
  );
  out = out.replace(
    /import\s+(?:\w+\s+from\s+)?["'](?:\.\.\/)+_internal\/Control\.module\.css["']/g,
    `import control from "${components}/form-control/control.module.css"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/controlSize["']/g,
    `from "${components}/form-control/control-size"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/Spinner["']/g,
    `from "${components}/form-control/spinner"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/buttonVariants\.module\.css["']/g,
    `from "${components}/button-variants/button-variants.module.css"`,
  );
  out = out.replace(
    /import\s+(?:\w+\s+from\s+)?["'](?:\.\.\/)+_internal\/buttonVariants\.module\.css["']/g,
    `import buttonVariants from "${components}/button-variants/button-variants.module.css"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/picker(?:\/index)?["']/g,
    `from "${components}/picker-field"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/picker\/PickerField["']/g,
    `from "${components}/picker-field/picker-field"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/picker\/usePickerOpen["']/g,
    `from "${components}/picker-field/use-picker-open"`,
  );

  // Visual runtime + shared helpers (docs/CLI WebGL & canvas visuals)
  out = out.replace(
    /from\s+["'](?:\.\.\/)+_internal\/visuals\/([^"']+)["']/g,
    (_m, file: string) => `from "${components}/visual-runtime/${file.replace(/\.(tsx|ts)$/, "")}"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+Visuals\/_shared\/([^"']+)["']/g,
    (_m, file: string) => `from "${components}/visual-shared/${file.replace(/\.(tsx|ts)$/, "")}"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)*_shared\/([^"']+)["']/g,
    (_m, file: string) => `from "${components}/visual-shared/${file.replace(/\.(tsx|ts)$/, "")}"`,
  );

  // Internal Lucide-derived icons → installed icons/ package
  out = out.replace(
    /from\s+["'](?:\.\.\/)+icons(?:\/index)?["']/g,
    `from "${components}/icons"`,
  );
  out = out.replace(
    /from\s+["'](?:\.\.\/)+icons\/([^"']+)["']/g,
    (_m, file: string) => {
      const base = file.replace(/\.(tsx|ts)$/, "");
      const kebab = base
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/_/g, "-")
        .toLowerCase();
      if (base === "createIcon") {
        return `from "${components}/icons/create-icon"`;
      }
      return `from "${components}/icons/${kebab}"`;
    },
  );

  for (const [folder, importPath] of Object.entries(COMPONENT_IMPORT_MAP)) {
    const re = new RegExp(
      `from\\s+["'](?:\\.\\./)+${escapeRegExp(folder)}/${escapeRegExp(folder)}["']`,
      "g",
    );
    out = out.replace(re, `from "${components}/${importPath}"`);
  }

  // Generic sibling: ../Foo/Foo → map if known
  out = out.replace(
    /from\s+["']\.\.\/([A-Za-z]+)\/\1["']/g,
    (_match, name: string) => {
      const mapped = COMPONENT_IMPORT_MAP[name];
      if (mapped) {
        return `from "${components}/${mapped}"`;
      }
      const kebab = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      return `from "${components}/${kebab}/${kebab}"`;
    },
  );

  // Rewrite same-directory relative imports when install basenames differ
  if (ctx.siblingRenames) {
    for (const [fromBase, toBase] of Object.entries(ctx.siblingRenames)) {
      if (fromBase === toBase) continue;
      const fromNoExt = fromBase.replace(/\.(tsx|ts|jsx|js|css|module\.css)$/i, "");
      const toNoExt = toBase.replace(/\.(tsx|ts|jsx|js|css|module\.css)$/i, "");
      // ./Button.module.css → ./button.module.css
      out = out.replace(
        new RegExp(`(["'])\\./${escapeRegExp(fromBase)}\\1`, "g"),
        `$1./${toBase}$1`,
      );
      // ./Button → ./button (extensionless TS imports)
      if (fromNoExt !== fromBase) {
        out = out.replace(
          new RegExp(`(["'])\\./${escapeRegExp(fromNoExt)}\\1`, "g"),
          `$1./${toNoExt}$1`,
        );
      }
    }
  }

  void ctx.items;

  return out;
}
