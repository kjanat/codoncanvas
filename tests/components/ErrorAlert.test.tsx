import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { ErrorAlert } from "@/components/ErrorAlert";

afterEach(() => cleanup());

describe("ErrorAlert", () => {
  describe("children rendering", () => {
    test("renders children text", () => {
      render(<ErrorAlert>Something went wrong</ErrorAlert>);

      expect(screen.getByText("Something went wrong")).toBeDefined();
    });

    test("renders children as JSX element", () => {
      render(
        <ErrorAlert>
          <span data-testid="custom-child">Error with details</span>
        </ErrorAlert>,
      );

      expect(screen.getByTestId("custom-child")).toBeDefined();
      expect(screen.getByText("Error with details")).toBeDefined();
    });

    test("renders multiple children elements", () => {
      render(
        <ErrorAlert>
          <strong>Error:</strong>
          <span>Invalid input</span>
        </ErrorAlert>,
      );

      expect(screen.getByText("Error:")).toBeDefined();
      expect(screen.getByText("Invalid input")).toBeDefined();
    });
  });

  describe("styling", () => {
    test("has base error styling classes", () => {
      render(<ErrorAlert>Error message</ErrorAlert>);

      const alert = screen.getByText("Error message");
      expect(alert.className).toContain("rounded-lg");
      expect(alert.className).toContain("border");
      expect(alert.className).toContain("border-danger/20");
      expect(alert.className).toContain("bg-danger/5");
      expect(alert.className).toContain("p-3");
      expect(alert.className).toContain("text-sm");
      expect(alert.className).toContain("text-danger");
    });

    test("custom className is appended", () => {
      render(<ErrorAlert className="mt-4 w-full">Error message</ErrorAlert>);

      const alert = screen.getByText("Error message");
      expect(alert.className).toContain("mt-4");
      expect(alert.className).toContain("w-full");
      // Base classes should still be present
      expect(alert.className).toContain("rounded-lg");
      expect(alert.className).toContain("text-danger");
    });

    test("empty className doesn't add extra space", () => {
      render(<ErrorAlert className="">Error message</ErrorAlert>);

      const alert = screen.getByText("Error message");
      const classAttr = alert.getAttribute("class") || "";

      // Should not have double spaces in the middle
      expect(classAttr).not.toMatch(/\s{2,}/);
    });

    test("default className produces consistent class string", () => {
      render(<ErrorAlert>Error message</ErrorAlert>);

      const alert = screen.getByText("Error message");
      const classAttr = alert.getAttribute("class") || "";

      // Should not have double spaces
      expect(classAttr).not.toMatch(/\s{2,}/);
    });
  });

  describe("accessibility", () => {
    test("renders as a div element", () => {
      render(<ErrorAlert>Error message</ErrorAlert>);

      const alert = screen.getByText("Error message");
      expect(alert.tagName).toBe("DIV");
    });
  });
});
