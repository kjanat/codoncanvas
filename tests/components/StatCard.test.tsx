import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { StatCard } from "@/components/StatCard";

afterEach(() => cleanup());

describe("StatCard", () => {
  describe("basic rendering", () => {
    test("renders label text", () => {
      render(<StatCard label="Test Label" value="100" />);
      expect(screen.getByText("Test Label")).toBeDefined();
    });

    test("renders value as string", () => {
      render(<StatCard label="Label" value="Hello World" />);
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    test("renders value as number", () => {
      render(<StatCard label="Label" value={42} />);
      expect(screen.getByText("42")).toBeDefined();
    });

    test("renders subtitle when provided", () => {
      render(<StatCard label="Label" subtitle="Extra info" value="100" />);
      expect(screen.getByText("Extra info")).toBeDefined();
    });

    test("does not render subtitle when not provided", () => {
      render(<StatCard label="Label" value="100" />);
      expect(screen.queryByText("Extra info")).toBeNull();
    });
  });

  describe("compact variant (default)", () => {
    test("default variant is compact", () => {
      const { container } = render(<StatCard label="Label" value="100" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("text-center");
    });

    test("compact variant has text-center class", () => {
      const { container } = render(
        <StatCard label="Label" value="100" variant="compact" />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("text-center");
    });

    test("compact variant uses text-2xl for value", () => {
      render(<StatCard label="Label" value="100" variant="compact" />);
      const valueElement = screen.getByText("100");
      expect(valueElement.className).toContain("text-2xl");
    });

    test("compact variant with danger=false uses text-primary for value", () => {
      render(
        <StatCard danger={false} label="Label" value="100" variant="compact" />,
      );
      const valueElement = screen.getByText("100");
      expect(valueElement.className).toContain("text-primary");
      expect(valueElement.className).not.toContain("text-danger");
    });

    test("compact variant with danger=true uses text-danger for value", () => {
      render(
        <StatCard danger={true} label="Label" value="100" variant="compact" />,
      );
      const valueElement = screen.getByText("100");
      expect(valueElement.className).toContain("text-danger");
      expect(valueElement.className).not.toContain("text-primary");
    });
  });

  describe("dashboard variant", () => {
    test("dashboard variant has p-6 class", () => {
      const { container } = render(
        <StatCard label="Label" value="100" variant="dashboard" />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("p-6");
    });

    test("dashboard variant uses text-3xl for value", () => {
      render(<StatCard label="Label" value="100" variant="dashboard" />);
      const valueElement = screen.getByText("100");
      expect(valueElement.className).toContain("text-3xl");
    });

    test("dashboard variant with danger=false uses text-text for value", () => {
      render(
        <StatCard
          danger={false}
          label="Label"
          value="100"
          variant="dashboard"
        />,
      );
      const valueElement = screen.getByText("100");
      expect(valueElement.className).toContain("text-text");
      expect(valueElement.className).not.toContain("text-danger");
    });

    test("dashboard variant with danger=true uses text-danger for value", () => {
      render(
        <StatCard
          danger={true}
          label="Label"
          value="100"
          variant="dashboard"
        />,
      );
      const valueElement = screen.getByText("100");
      expect(valueElement.className).toContain("text-danger");
      expect(valueElement.className).not.toContain("text-text");
    });

    test("dashboard variant renders subtitle when provided", () => {
      render(
        <StatCard
          label="Label"
          subtitle="Dashboard subtitle"
          value="100"
          variant="dashboard"
        />,
      );
      expect(screen.getByText("Dashboard subtitle")).toBeDefined();
    });
  });
});
