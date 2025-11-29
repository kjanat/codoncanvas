/**
 * ErrorBoundary - Catches and displays React errors gracefully
 *
 * Prevents crashes from propagating and shows a user-friendly error message
 * with the option to retry or navigate away.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional fallback UI (default: built-in error display) */
  fallback?: ReactNode;
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for catching React errors.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
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
    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
              <svg
                aria-hidden="true"
                className="h-8 w-8 text-danger"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
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
