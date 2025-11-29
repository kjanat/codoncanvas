import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Label } from "@/components/Label";

afterEach(() => {
  cleanup();
});

describe("Label", () => {
  test("renders children", () => {
    render(<Label htmlFor="test">Test Label</Label>);
    expect(screen.getByText("Test Label")).toBeDefined();
  });

  test("applies htmlFor attribute", () => {
    render(<Label htmlFor="my-input">Label</Label>);
    const label = screen.getByText("Label");
    expect(label.getAttribute("for")).toBe("my-input");
  });

  test("shows required indicator when required prop is true", () => {
    render(<Label required>Required Field</Label>);
    expect(screen.getByText("*")).toBeDefined();
  });

  test("does not show required indicator by default", () => {
    render(<Label>Optional Field</Label>);
    expect(screen.queryByText("*")).toBeNull();
  });

  test("applies custom className", () => {
    render(<Label className="custom-class">Label</Label>);
    const label = screen.getByText("Label");
    expect(label.className).toContain("custom-class");
  });

  test("has default styling classes", () => {
    render(<Label>Label</Label>);
    const label = screen.getByText("Label");
    expect(label.className).toContain("text-sm");
    expect(label.className).toContain("font-medium");
  });
});
