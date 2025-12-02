import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FilterToggle } from "@/components/FilterToggle";

afterEach(() => {
  cleanup();
});

const options = [
  { value: "all", label: "All" },
  { value: "basics", label: "Basics" },
  { value: "advanced", label: "Advanced" },
] as const;

describe("FilterToggle", () => {
  test("renders all options", () => {
    render(
      <FilterToggle
        onSelect={() => {}}
        options={[...options]}
        selected="all"
      />,
    );

    expect(screen.getByText("All")).toBeDefined();
    expect(screen.getByText("Basics")).toBeDefined();
    expect(screen.getByText("Advanced")).toBeDefined();
  });

  test("calls onSelect when option is clicked", () => {
    const handleSelect = mock(() => {});
    render(
      <FilterToggle
        onSelect={handleSelect}
        options={[...options]}
        selected="all"
      />,
    );

    fireEvent.click(screen.getByText("Basics"));
    expect(handleSelect).toHaveBeenCalledWith("basics");
  });

  test("highlights selected option", () => {
    render(
      <FilterToggle
        onSelect={() => {}}
        options={[...options]}
        selected="basics"
      />,
    );

    const basicsBtn = screen.getByText("Basics");
    expect(basicsBtn.className).toContain("bg-primary");
    expect(basicsBtn.className).toContain("text-white");
  });

  test("applies pill variant class", () => {
    render(
      <FilterToggle
        onSelect={() => {}}
        options={[...options]}
        selected="all"
        variant="pill"
      />,
    );

    const allBtn = screen.getByText("All");
    expect(allBtn.className).toContain("rounded-full");
  });

  test("applies rounded variant class by default", () => {
    render(
      <FilterToggle
        onSelect={() => {}}
        options={[...options]}
        selected="all"
      />,
    );

    const allBtn = screen.getByText("All");
    expect(allBtn.className).toContain("rounded-lg");
  });

  test("applies small size variant", () => {
    render(
      <FilterToggle
        onSelect={() => {}}
        options={[...options]}
        selected="all"
        size="sm"
      />,
    );

    const allBtn = screen.getByText("All");
    expect(allBtn.className).toContain("text-xs");
  });

  test("applies custom className to container", () => {
    render(
      <FilterToggle
        className="my-custom-class"
        onSelect={() => {}}
        options={[...options]}
        selected="all"
      />,
    );

    const container = screen.getByText("All").parentElement;
    expect(container?.className).toContain("my-custom-class");
  });
});
