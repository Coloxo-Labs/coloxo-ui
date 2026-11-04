import { useId as useReactId } from "react";

export function useId(id?: string): string {
  const generated = useReactId();
  return id ?? generated;
}
