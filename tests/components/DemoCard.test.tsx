/**
 * DemoCard Component Tests
 */

import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, screen, waitFor } from "@testing-library/react";

import { DemoCard, type DemoCardProps } from "@/components/DemoCard";
import { renderWithRouter } from "../test-utils/router-wrapper";

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
  return renderWithRouter(<DemoCard {...defaultProps} {...props} />);
}

describe("DemoCard", () => {
  test("renders title", async () => {
    renderDemoCard();
    await waitFor(() => {
      expect(screen.getByText("Test Demo")).toBeDefined();
    });
  });

  test("renders description", async () => {
    renderDemoCard();
    await waitFor(() => {
      expect(screen.getByText("A test demo description")).toBeDefined();
    });
  });

  test("renders Open Demo link text", async () => {
    renderDemoCard();
    await waitFor(() => {
      expect(screen.getByText("Open Demo")).toBeDefined();
    });
  });

  test("links to correct path", async () => {
    renderDemoCard({ path: "/demos/mutation" });
    await waitFor(() => {
      const link = screen.getByRole("link");
      expect(link.getAttribute("href")).toBe("/demos/mutation");
    });
  });

  test("renders with custom title", async () => {
    renderDemoCard({ title: "Custom Title" });
    await waitFor(() => {
      expect(screen.getByText("Custom Title")).toBeDefined();
    });
  });

  test("renders with custom description", async () => {
    renderDemoCard({ description: "Custom description here" });
    await waitFor(() => {
      expect(screen.getByText("Custom description here")).toBeDefined();
    });
  });

  test("applies gradient color class to accent bar", async () => {
    const { container } = renderDemoCard({
      color: "from-blue-500 to-cyan-500",
    });
    await waitFor(() => {
      const accentBar = container.querySelector(".bg-linear-to-r");
      expect(accentBar).toBeDefined();
      expect(accentBar?.className).toContain("from-blue-500");
      expect(accentBar?.className).toContain("to-cyan-500");
    });
  });

  test("renders SVG icon with provided path", async () => {
    const { container } = renderDemoCard({ icon: "M9 5l7 7-7 7" });
    await waitFor(() => {
      const svgPath = container.querySelector("svg path");
      expect(svgPath?.getAttribute("d")).toBe("M9 5l7 7-7 7");
    });
  });

  test("has correct base card styling", async () => {
    const { container } = renderDemoCard();
    await waitFor(() => {
      const link = container.querySelector("a");
      expect(link?.className).toContain("rounded-xl");
      expect(link?.className).toContain("border");
      expect(link?.className).toContain("bg-white");
      expect(link?.className).toContain("shadow-sm");
    });
  });

  test("icon container has gradient background", async () => {
    const { container } = renderDemoCard({
      color: "from-green-500 to-emerald-500",
    });
    await waitFor(() => {
      const iconContainer = container.querySelector(".inline-flex.rounded-lg");
      expect(iconContainer?.className).toContain("bg-linear-to-r");
      expect(iconContainer?.className).toContain("from-green-500");
    });
  });

  test("arrow icon is present", async () => {
    const { container } = renderDemoCard();
    await waitFor(() => {
      const arrows = container.querySelectorAll("svg");
      // Should have 2 SVGs: icon and arrow
      expect(arrows.length).toBe(2);
      // Arrow should have the arrow path
      const arrowPath = arrows[1]?.querySelector("path");
      expect(arrowPath?.getAttribute("d")).toBe("M9 5l7 7-7 7");
    });
  });

  test("title has hover effect class on parent", async () => {
    const { container } = renderDemoCard();
    await waitFor(() => {
      const link = container.querySelector("a");
      expect(link?.className).toContain("group");
    });
  });
});
