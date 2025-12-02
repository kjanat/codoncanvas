import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Select } from "@/components/Select";

afterEach(() => {
  cleanup();
});

const STRING_OPTIONS = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

const NUMBER_OPTIONS = [
  { value: 100, label: "Slow" },
  { value: 500, label: "Normal" },
  { value: 1000, label: "Fast" },
];

describe("Select", () => {
  test("renders all options", () => {
    const onChange = mock(() => {});
    render(<Select onChange={onChange} options={STRING_OPTIONS} value="a" />);

    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByText("Option A")).toBeDefined();
    expect(screen.getByText("Option B")).toBeDefined();
    expect(screen.getByText("Option C")).toBeDefined();
  });

  test("calls onChange with string value", () => {
    const onChange = mock(() => {});
    render(<Select onChange={onChange} options={STRING_OPTIONS} value="a" />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledWith("b");
  });

  test("calls onChange with number value", () => {
    const onChange = mock(() => {});
    render(<Select onChange={onChange} options={NUMBER_OPTIONS} value={500} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "1000" },
    });
    expect(onChange).toHaveBeenCalledWith(1000);
  });

  test("applies disabled state", () => {
    const onChange = mock(() => {});
    render(
      <Select
        disabled
        onChange={onChange}
        options={STRING_OPTIONS}
        value="a"
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  test("applies size sm variant", () => {
    const onChange = mock(() => {});
    render(
      <Select
        onChange={onChange}
        options={STRING_OPTIONS}
        size="sm"
        value="a"
      />,
    );

    expect(screen.getByRole("combobox").className).toContain("text-xs");
  });

  test("applies size md variant", () => {
    const onChange = mock(() => {});
    render(
      <Select
        onChange={onChange}
        options={STRING_OPTIONS}
        size="md"
        value="a"
      />,
    );

    expect(screen.getByRole("combobox").className).toContain("text-sm");
  });

  test("applies custom className", () => {
    const onChange = mock(() => {});
    render(
      <Select
        className="custom-class"
        onChange={onChange}
        options={STRING_OPTIONS}
        value="a"
      />,
    );

    expect(screen.getByRole("combobox").className).toContain("custom-class");
  });

  test("passes through additional props", () => {
    const onChange = mock(() => {});
    render(
      <Select
        id="my-select"
        onChange={onChange}
        options={STRING_OPTIONS}
        value="a"
      />,
    );

    expect(screen.getByRole("combobox").getAttribute("id")).toBe("my-select");
  });
});
