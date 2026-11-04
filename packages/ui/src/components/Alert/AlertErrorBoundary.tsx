"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Alert } from "./Alert";

export type AlertErrorBoundaryProps = {
  children: ReactNode;
  /** Ant Design alias for title */
  message?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class AlertErrorBoundary extends Component<AlertErrorBoundaryProps, State> {
  override state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  override render() {
    const { children, message, title, description } = this.props;

    if (this.state.hasError) {
      const resolvedDescription =
        description ?? (this.state.error ? this.state.error.message : undefined);

      return (
        <Alert
          variant="error"
          title={title ?? message ?? "Something went wrong"}
          description={resolvedDescription}
        />
      );
    }

    return children;
  }
}
