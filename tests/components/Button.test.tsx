import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/Button";

afterEach(() => cleanup());

describe("Button", () => {
  describe("rendering", () => {
    test("renders children text", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
    });

    test("has type='button' by default", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button").getAttribute("type")).toBe("button");
    });

    test("can override type to 'submit'", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
    });
  });

  describe("variants", () => {
    test("default variant is 'primary' with correct classes", () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-primary");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("hover:bg-primary-hover");
    });

    test("primary variant applies correct classes", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-primary");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("hover:bg-primary-hover");
    });

    test("secondary variant applies correct classes", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("border");
      expect(button.className).toContain("border-border");
      expect(button.className).toContain("bg-surface");
      expect(button.className).toContain("text-text");
      expect(button.className).toContain("hover:bg-bg-light");
    });

    test("success variant applies correct classes", () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-success");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("hover:bg-success-hover");
    });

    test("danger variant applies correct classes", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-danger");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("hover:bg-danger-hover");
    });

    test("ghost variant applies correct classes", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-text");
      expect(button.className).toContain("hover:bg-bg-light");
    });
  });

  describe("sizes", () => {
    test("default size is 'md'", () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-4");
      expect(button.className).toContain("py-2");
      expect(button.className).toContain("text-sm");
    });

    test("sm size applies correct classes", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-3");
      expect(button.className).toContain("py-1.5");
      expect(button.className).toContain("text-sm");
    });

    test("md size applies correct classes", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-4");
      expect(button.className).toContain("py-2");
      expect(button.className).toContain("text-sm");
    });

    test("lg size applies correct classes", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-6");
      expect(button.className).toContain("py-3");
      expect(button.className).toContain("text-base");
    });
  });

  describe("fullWidth", () => {
    test("fullWidth adds 'w-full' class", () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole("button").className).toContain("w-full");
    });

    test("fullWidth=false does not add 'w-full' class", () => {
      render(<Button fullWidth={false}>Not Full</Button>);
      expect(screen.getByRole("button").className).not.toContain("w-full");
    });
  });

  describe("disabled", () => {
    test("disabled prop disables the button", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button") as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    test("disabled button has disabled cursor class", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button").className).toContain(
        "disabled:cursor-not-allowed",
      );
    });
  });

  describe("className", () => {
    test("custom className is merged with base classes", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("custom-class");
      expect(button.className).toContain("rounded-lg");
      expect(button.className).toContain("font-medium");
    });
  });

  describe("events", () => {
    test("click handler is called", () => {
      const handleClick = mock(() => {});
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("click handler is not called when disabled", () => {
      const handleClick = mock(() => {});
      render(
        <Button disabled onClick={handleClick}>
          Click
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("HTML attributes", () => {
    test("passes through aria-label", () => {
      render(<Button aria-label="Custom label">Btn</Button>);
      expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
        "Custom label",
      );
    });

    test("passes through data-testid", () => {
      render(<Button data-testid="my-button">Test</Button>);
      expect(screen.getByTestId("my-button")).toBeDefined();
    });

    test("passes through id attribute", () => {
      render(<Button id="btn-id">ID</Button>);
      expect(screen.getByRole("button").getAttribute("id")).toBe("btn-id");
    });

    test("passes through aria-pressed", () => {
      render(<Button aria-pressed="true">Pressed</Button>);
      expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
        "true",
      );
    });
  });

  describe("base classes", () => {
    test("applies base styling classes", () => {
      render(<Button>Base</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("rounded-lg");
      expect(button.className).toContain("font-medium");
      expect(button.className).toContain("transition-colors");
    });
  });
});
