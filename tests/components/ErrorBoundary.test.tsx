import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

afterEach(() => cleanup());

// Helper component that throws when shouldThrow is true
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>Normal content</div>;
}

// Helper to create a component that can toggle throwing
function createToggleableThrowingComponent() {
  let shouldThrow = true;
  return {
    Component: () => {
      if (shouldThrow) {
        throw new Error("Test error message");
      }
      return <div>Normal content</div>;
    },
    stopThrowing: () => {
      shouldThrow = false;
    },
  };
}

describe("ErrorBoundary", () => {
  describe("normal rendering", () => {
    test("renders children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );
      expect(screen.getByText("Normal content")).toBeDefined();
    });

    test("renders multiple children without error", () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>,
      );
      expect(screen.getByText("Child 1")).toBeDefined();
      expect(screen.getByText("Child 2")).toBeDefined();
    });

    test("does not show error UI when children render successfully", () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });
  });

  describe("error handling", () => {
    test("shows default error UI when child throws", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeDefined();
      consoleSpy.mockRestore();
    });

    test("displays 'Something went wrong' heading", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const heading = screen.getByRole("heading", {
        name: "Something went wrong",
      });
      expect(heading).toBeDefined();
      expect(heading.tagName).toBe("H2");
      consoleSpy.mockRestore();
    });

    test("displays description text", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(
        screen.getByText(
          "An unexpected error occurred while rendering this component.",
        ),
      ).toBeDefined();
      consoleSpy.mockRestore();
    });

    test("shows error message in details", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Error details")).toBeDefined();
      expect(screen.getByText("Test error message")).toBeDefined();
      consoleSpy.mockRestore();
    });

    test("error details is expandable", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const details = screen.getByText("Error details").closest("details");
      expect(details).toBeDefined();
      expect(details?.tagName).toBe("DETAILS");
      consoleSpy.mockRestore();
    });

    test("displays warning icon container", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // The WarningIcon should be present in the error UI
      const iconContainer = container.querySelector(".bg-danger\\/10");
      expect(iconContainer).toBeDefined();
      consoleSpy.mockRestore();
    });
  });

  describe("Try Again button", () => {
    test("shows 'Try Again' button", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByRole("button", { name: "Try Again" })).toBeDefined();
      consoleSpy.mockRestore();
    });

    test("'Try Again' button has correct type attribute", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const button = screen.getByRole("button", { name: "Try Again" });
      expect(button.getAttribute("type")).toBe("button");
      consoleSpy.mockRestore();
    });

    test("'Try Again' button resets error state and re-renders children", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      const { Component, stopThrowing } = createToggleableThrowingComponent();

      render(
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>,
      );

      // Initially shows error
      expect(screen.getByText("Something went wrong")).toBeDefined();

      // Fix the throwing component before retry
      stopThrowing();

      // Click Try Again
      fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

      // Should now show normal content
      expect(screen.getByText("Normal content")).toBeDefined();
      expect(screen.queryByText("Something went wrong")).toBeNull();

      consoleSpy.mockRestore();
    });

    test("'Try Again' shows error UI again if child still throws", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeDefined();

      // Click Try Again - component still throws
      fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

      // Should still show error UI
      expect(screen.getByText("Something went wrong")).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe("Go Home link", () => {
    test("shows 'Go Home' link", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByRole("link", { name: "Go Home" })).toBeDefined();
      consoleSpy.mockRestore();
    });

    test("'Go Home' link has href='/'", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const link = screen.getByRole("link", { name: "Go Home" });
      expect(link.getAttribute("href")).toBe("/");
      consoleSpy.mockRestore();
    });
  });

  describe("custom fallback", () => {
    test("renders custom fallback when provided", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Custom error UI")).toBeDefined();
      expect(screen.queryByText("Something went wrong")).toBeNull();
      consoleSpy.mockRestore();
    });

    test("custom fallback replaces entire default error UI", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary
          fallback={
            <div data-testid="custom-fallback">
              <h1>Oops!</h1>
              <p>Something bad happened</p>
            </div>
          }
        >
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("custom-fallback")).toBeDefined();
      expect(screen.getByText("Oops!")).toBeDefined();
      expect(screen.getByText("Something bad happened")).toBeDefined();
      expect(screen.queryByRole("button", { name: "Try Again" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Go Home" })).toBeNull();
      consoleSpy.mockRestore();
    });

    test("renders children when no error even with fallback provided", () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Normal content")).toBeDefined();
      expect(screen.queryByText("Custom error UI")).toBeNull();
    });
  });

  describe("onError callback", () => {
    test("onError callback is called with error and errorInfo", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      const onError = mock(() => {});

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });

    test("onError receives the error object as first argument", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      const onError = mock(() => {});

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const calls = onError.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const firstCall = calls[0] as unknown as [Error, unknown];
      const [error] = firstCall;
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error message");
      consoleSpy.mockRestore();
    });

    test("onError receives errorInfo as second argument", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      const onError = mock(() => {});

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const calls = onError.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const firstCall = calls[0] as unknown as [
        Error,
        { componentStack: string },
      ];
      const [_error, errorInfo] = firstCall;
      expect(errorInfo).toBeDefined();
      expect(typeof errorInfo.componentStack).toBe("string");
      consoleSpy.mockRestore();
    });

    test("onError is not called when no error occurs", () => {
      const onError = mock(() => {});

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(onError).not.toHaveBeenCalled();
    });

    test("works without onError callback", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeDefined();
      consoleSpy.mockRestore();
    });
  });

  describe("console.error logging", () => {
    test("logs error to console.error", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Check that console.error was called
      expect(consoleSpy).toHaveBeenCalled();

      // Find the ErrorBoundary's log message
      const errorBoundaryCall = consoleSpy.mock.calls.find(
        (call) =>
          typeof call[0] === "string" &&
          call[0].includes("ErrorBoundary caught an error"),
      );
      expect(errorBoundaryCall).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe("styling", () => {
    test("error container has flex layout classes", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain("flex");
      expect(outerDiv.className).toContain("min-h-[50vh]");
      expect(outerDiv.className).toContain("items-center");
      expect(outerDiv.className).toContain("justify-center");
      consoleSpy.mockRestore();
    });

    test("'Try Again' button has primary styling", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const button = screen.getByRole("button", { name: "Try Again" });
      expect(button.className).toContain("bg-primary");
      expect(button.className).toContain("text-white");
      consoleSpy.mockRestore();
    });

    test("'Go Home' link has secondary styling", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const link = screen.getByRole("link", { name: "Go Home" });
      expect(link.className).toContain("bg-bg-light");
      expect(link.className).toContain("text-text");
      consoleSpy.mockRestore();
    });
  });

  describe("error details display", () => {
    test("shows different error messages correctly", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      function CustomErrorComponent(): React.ReactNode {
        throw new Error("Custom error: something specific went wrong");
      }

      render(
        <ErrorBoundary>
          <CustomErrorComponent />
        </ErrorBoundary>,
      );

      expect(
        screen.getByText("Custom error: something specific went wrong"),
      ).toBeDefined();
      consoleSpy.mockRestore();
    });

    test("error message is in pre tag for code formatting", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const errorMessage = screen.getByText("Test error message");
      expect(errorMessage.tagName).toBe("PRE");
      consoleSpy.mockRestore();
    });
  });
});
