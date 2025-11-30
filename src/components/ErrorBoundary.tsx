/**
 * ErrorBoundary - Catches and displays React errors gracefully
 *
 * Prevents crashes from propagating and shows a user-friendly error message
 * with the option to retry or navigate away.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { WarningIcon } from "@/ui/icons";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for catching React errors.
 * Must be a class component - React doesn't support error boundaries with hooks.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
              <WarningIcon className="h-8 w-8 text-danger" />
            </div>

            <h2 className="mb-2 text-xl font-semibold text-text">
              Something went wrong
            </h2>

            <p className="mb-4 text-text-muted">
              An unexpected error occurred while rendering this component.
            </p>

            {this.state.error && (
              <details className="mb-4 rounded-lg bg-bg-light p-3 text-left">
                <summary className="cursor-pointer text-sm font-medium text-text">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-danger">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex justify-center gap-3">
              <button
                className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
                onClick={this.handleRetry}
                type="button"
              >
                Try Again
              </button>
              <a
                className="rounded-lg bg-bg-light px-4 py-2 font-medium text-text transition-colors hover:bg-border"
                href="/"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
