"use client";

import type { ReactNode } from "react";
import { FormField, fieldDescribedBy } from "../../FormField/FormField";
import { useId } from "../../../utils/useId";

export function usePickerFieldIds(id?: string) {
  const inputId = useId(id);
  return { inputId };
}

export function PickerFieldShell({
  label,
  required,
  optional,
  description,
  error,
  inputId,
  children,
}: {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  inputId: string;
  children: ReactNode;
}) {
  if (!label && !description && !error) return children;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      optional={optional}
      description={description}
      error={error}
    >
      {children}
    </FormField>
  );
}

export function usePickerAria({
  inputId,
  description,
  error,
}: {
  inputId: string;
  description?: ReactNode;
  error?: ReactNode;
}) {
  return fieldDescribedBy({ id: inputId, description, error });
}
