/**
 * DemoCard Component Tests
 */

import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DemoCard, type DemoCardProps } from "@/components/DemoCard";

afterEach(() => {
  cleanup();
});

const defaultProps: DemoCardProps = {
  path: "/demos/test",
  title: "Test Demo",
  description: "A test demo description",
  icon: "M12 6v6h4.5",
  color: "from-purple-500 to-pink-500",
};

function renderDemoCard(props: Partial<DemoCardProps> = {}) {
  return render(
    <MemoryRouter>
      <DemoCard {...defaultProps} {...props} />
    </MemoryRouter>,
  );
}

describe("DemoCard", () => {
  test("renders title", () => {
    renderDemoCard();
    expect(screen.getByText("Test Demo")).toBeDefined();
  });

  test("renders description", () => {
    renderDemoCard();
    expect(screen.getByText("A test demo description")).toBeDefined();
  });

  test("renders Open Demo link text", () => {
    renderDemoCard();
    expect(screen.getByText("Open Demo")).toBeDefined();
  });

  test("links to correct path", () => {
    renderDemoCard({ path: "/demos/mutation" });
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/demos/mutation");
  });

  test("renders with custom title", () => {
    renderDemoCard({ title: "Custom Title" });
    expect(screen.getByText("Custom Title")).toBeDefined();
  });

  test("renders with custom description", () => {
    renderDemoCard({ description: "Custom description here" });
    expect(screen.getByText("Custom description here")).toBeDefined();
  });

  test("applies gradient color class to accent bar", () => {
    const { container } = renderDemoCard({
      color: "from-blue-500 to-cyan-500",
    });
    const accentBar = container.querySelector(".bg-linear-to-r");
    expect(accentBar).toBeDefined();
    expect(accentBar?.className).toContain("from-blue-500");
    expect(accentBar?.className).toContain("to-cyan-500");
  });

  test("renders SVG icon with provided path", () => {
    const { container } = renderDemoCard({ icon: "M9 5l7 7-7 7" });
    const svgPath = container.querySelector("svg path");
    expect(svgPath?.getAttribute("d")).toBe("M9 5l7 7-7 7");
  });

  test("has correct base card styling", () => {
    const { container } = renderDemoCard();
    const link = container.querySelector("a");
    expect(link?.className).toContain("rounded-xl");
    expect(link?.className).toContain("border");
    expect(link?.className).toContain("bg-white");
    expect(link?.className).toContain("shadow-sm");
  });

  test("icon container has gradient background", () => {
    const { container } = renderDemoCard({
      color: "from-green-500 to-emerald-500",
    });
    const iconContainer = container.querySelector(".inline-flex.rounded-lg");
    expect(iconContainer?.className).toContain("bg-linear-to-r");
    expect(iconContainer?.className).toContain("from-green-500");
  });

  test("arrow icon is present", () => {
    const { container } = renderDemoCard();
    const arrows = container.querySelectorAll("svg");
    // Should have 2 SVGs: icon and arrow
    expect(arrows.length).toBe(2);
    // Arrow should have the arrow path
    const arrowPath = arrows[1]?.querySelector("path");
    expect(arrowPath?.getAttribute("d")).toBe("M9 5l7 7-7 7");
  });

  test("title has hover effect class on parent", () => {
    const { container } = renderDemoCard();
    const link = container.querySelector("a");
    expect(link?.className).toContain("group");
  });
});
