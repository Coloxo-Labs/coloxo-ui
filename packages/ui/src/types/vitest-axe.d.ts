declare module "vitest-axe/matchers" {
  import type { MatcherFunction } from "vitest";
  export const toHaveNoViolations: MatcherFunction;
}

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {
    toHaveNoViolations(): void;
  }
}

export {};
