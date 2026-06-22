import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: ReactNode;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: FormFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span className="field-message error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="field-message" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {descriptionId && <span className="sr-only">{descriptionId}</span>}
    </div>
  );
}
