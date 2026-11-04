/**
 * Registry schema lives in the CLI package so generation, validation, and
 * installation all parse manifests with one implementation.
 * Re-exported here for scripts that import 
egistry/schema.ts.
 */
export * from "../packages/cli/src/registry/schema.ts";
