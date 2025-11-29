import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RangeSlider } from "@/components/RangeSlider";

afterEach(() => {
  cleanup();
});

describe("RangeSlider", () => {
  test("renders with correct attributes", () => {
    const onChange = mock(() => {});
    render(<RangeSlider max={100} min={0} onChange={onChange} value={50} />);

    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider).toBeDefined();
    expect(slider.getAttribute("type")).toBe("range");
    expect(slider.getAttribute("min")).toBe("0");
    expect(slider.getAttribute("max")).toBe("100");
    expect(slider.value).toBe("50");
  });

  test("calls onChange with number value", () => {
    const onChange = mock(() => {});
    render(<RangeSlider max={100} min={0} onChange={onChange} value={50} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });
    expect(onChange).toHaveBeenCalledWith(75);
  });

  test("applies step attribute", () => {
    const onChange = mock(() => {});
    render(
      <RangeSlider
        max={100}
        min={0}
        onChange={onChange}
        step={10}
        value={50}
      />,
    );

    expect(screen.getByRole("slider").getAttribute("step")).toBe("10");
  });

  test("applies disabled state", () => {
    const onChange = mock(() => {});
    render(
      <RangeSlider disabled max={100} min={0} onChange={onChange} value={50} />,
    );

    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.disabled).toBe(true);
  });

  test("applies custom className", () => {
    const onChange = mock(() => {});
    render(
      <RangeSlider
        className="custom-class"
        max={100}
        min={0}
        onChange={onChange}
        value={50}
      />,
    );

    expect(screen.getByRole("slider").className).toContain("custom-class");
  });

  test("passes through additional props", () => {
    const onChange = mock(() => {});
    render(
      <RangeSlider
        id="my-slider"
        max={100}
        min={0}
        onChange={onChange}
        value={50}
      />,
    );

    expect(screen.getByRole("slider").getAttribute("id")).toBe("my-slider");
  });

  test("handles decimal step values", () => {
    const onChange = mock(() => {});
    render(
      <RangeSlider
        max={1}
        min={0}
        onChange={onChange}
        step={0.1}
        value={0.5}
      />,
    );

    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.getAttribute("step")).toBe("0.1");
    expect(slider.value).toBe("0.5");
  });
});
