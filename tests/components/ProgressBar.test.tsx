import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { ProgressBar } from "@/components/ProgressBar";

afterEach(() => {
  cleanup();
});

// Helper to get container (outer) and inner bar elements
function getElements(container: HTMLElement) {
  const outer = container.firstChild as HTMLElement;
  const inner = outer?.firstChild as HTMLElement;
  return { outer, inner };
}

describe("ProgressBar", () => {
  test("renders with correct value", () => {
    const { container } = render(<ProgressBar value={50} />);
    const { inner } = getElements(container);
    expect(inner?.getAttribute("style")).toContain("width: 50%");
  });

  test("clamps value to 0-100 range", () => {
    const { container, rerender } = render(<ProgressBar value={-10} />);
    let { inner } = getElements(container);
    expect(inner?.getAttribute("style")).toContain("width: 0%");

    rerender(<ProgressBar value={150} />);
    ({ inner } = getElements(container));
    expect(inner?.getAttribute("style")).toContain("width: 100%");
  });

  test("applies primary variant", () => {
    const { container } = render(<ProgressBar value={50} variant="primary" />);
    const { inner } = getElements(container);
    expect(inner?.className).toContain("bg-primary");
  });

  test("applies success variant", () => {
    const { container } = render(<ProgressBar value={50} variant="success" />);
    const { inner } = getElements(container);
    expect(inner?.className).toContain("bg-success");
  });

  test("applies gradient variant", () => {
    const { container } = render(<ProgressBar value={50} variant="gradient" />);
    const { inner } = getElements(container);
    expect(inner?.className).toContain("bg-linear-to-r");
  });

  test("applies custom gradient class", () => {
    const { container } = render(
      <ProgressBar
        gradientClass="from-blue-500 to-cyan-500"
        value={50}
        variant="gradient"
      />,
    );
    const { inner } = getElements(container);
    expect(inner?.className).toContain("from-blue-500");
  });

  test("applies size sm", () => {
    const { container } = render(<ProgressBar size="sm" value={50} />);
    const { outer } = getElements(container);
    expect(outer?.className).toContain("h-1.5");
  });

  test("applies size md", () => {
    const { container } = render(<ProgressBar size="md" value={50} />);
    const { outer } = getElements(container);
    expect(outer?.className).toContain("h-2");
  });

  test("applies custom className", () => {
    const { container } = render(
      <ProgressBar className="custom-class" value={50} />,
    );
    const { outer } = getElements(container);
    expect(outer?.className).toContain("custom-class");
  });

  test("applies custom background class", () => {
    const { container } = render(
      <ProgressBar bgClass="bg-surface" value={50} />,
    );
    const { outer } = getElements(container);
    expect(outer?.className).toContain("bg-surface");
  });
});
