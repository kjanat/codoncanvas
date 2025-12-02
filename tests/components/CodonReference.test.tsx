import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CodonReference } from "@/components/CodonReference";
import { CATEGORIES, CATEGORY_COLORS } from "@/data";

afterEach(() => cleanup());

describe("CodonReference", () => {
  describe("collapsed state", () => {
    test("renders only expand button when collapsed=true", () => {
      render(<CodonReference collapsed={true} />);
      const button = screen.getByRole("button");
      expect(button).toBeDefined();
      expect(screen.queryByText("Codon Reference")).toBeNull();
    });

    test("expand button has title 'Show codon reference'", () => {
      render(<CodonReference collapsed={true} />);
      const button = screen.getByRole("button");
      expect(button.getAttribute("title")).toBe("Show codon reference");
    });

    test("clicking expand button calls onToggleCollapse", () => {
      const onToggleCollapse = mock(() => {});
      render(
        <CodonReference collapsed={true} onToggleCollapse={onToggleCollapse} />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    });

    test("expand button contains chevron icon", () => {
      render(<CodonReference collapsed={true} />);
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).toBeDefined();
      expect(svg?.classList.contains("h-5")).toBe(true);
      expect(svg?.classList.contains("w-5")).toBe(true);
    });
  });

  describe("expanded state (default)", () => {
    test("renders header 'Codon Reference'", () => {
      render(<CodonReference />);
      expect(screen.getByText("Codon Reference")).toBeDefined();
    });

    test("renders collapse button with title 'Hide reference' when onToggleCollapse provided", () => {
      const onToggleCollapse = mock(() => {});
      render(<CodonReference onToggleCollapse={onToggleCollapse} />);
      const closeButton = screen.getByTitle("Hide reference");
      expect(closeButton).toBeDefined();
      expect(closeButton.getAttribute("type")).toBe("button");
    });

    test("clicking collapse button calls onToggleCollapse", () => {
      const onToggleCollapse = mock(() => {});
      render(<CodonReference onToggleCollapse={onToggleCollapse} />);
      fireEvent.click(screen.getByTitle("Hide reference"));
      expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    });

    test("no collapse button when onToggleCollapse undefined", () => {
      render(<CodonReference />);
      expect(screen.queryByTitle("Hide reference")).toBeNull();
    });

    test("collapsed defaults to false", () => {
      render(<CodonReference />);
      expect(screen.getByText("Codon Reference")).toBeDefined();
      expect(screen.getByPlaceholderText("Search codons...")).toBeDefined();
    });
  });

  describe("search", () => {
    test("renders search input with placeholder 'Search codons...'", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");
      expect(input).toBeDefined();
      expect(input.getAttribute("type")).toBe("search");
    });

    test("typing filters displayed opcodes by name", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");

      // Initially should show multiple opcodes
      expect(screen.getByText("CIRCLE")).toBeDefined();
      expect(screen.getByText("RECT")).toBeDefined();

      // Search for CIRCLE
      fireEvent.change(input, { target: { value: "circle" } });

      // Should show CIRCLE but not RECT
      expect(screen.getByText("CIRCLE")).toBeDefined();
      expect(screen.queryByText("RECT")).toBeNull();
    });

    test("search filters by description", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");

      // Search for "radius" which is in CIRCLE's description
      fireEvent.change(input, { target: { value: "radius" } });

      expect(screen.getByText("CIRCLE")).toBeDefined();
      expect(screen.queryByText("RECT")).toBeNull();
    });

    test("search filters by codon", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");

      // ATG is the START codon
      fireEvent.change(input, { target: { value: "ATG" } });

      expect(screen.getByText("START")).toBeDefined();
    });

    test("search is case insensitive", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");

      fireEvent.change(input, { target: { value: "CIRCLE" } });
      expect(screen.getByText("CIRCLE")).toBeDefined();

      fireEvent.change(input, { target: { value: "circle" } });
      expect(screen.getByText("CIRCLE")).toBeDefined();
    });
  });

  describe("category filtering", () => {
    test("renders all category buttons from CATEGORIES", () => {
      render(<CodonReference />);

      for (const cat of CATEGORIES) {
        expect(screen.getByRole("button", { name: cat.label })).toBeDefined();
      }
    });

    test("default category is 'all'", () => {
      render(<CodonReference />);
      const allButton = screen.getByRole("button", { name: "All" });
      // Active category has white text
      expect(allButton.className).toContain("text-white");
    });

    test("clicking category filters opcodes", () => {
      render(<CodonReference />);

      // Click on Drawing category
      fireEvent.click(screen.getByRole("button", { name: "Drawing" }));

      // Should show drawing opcodes
      expect(screen.getByText("CIRCLE")).toBeDefined();
      expect(screen.getByText("RECT")).toBeDefined();
      expect(screen.getByText("LINE")).toBeDefined();

      // Should not show non-drawing opcodes
      expect(screen.queryByText("START")).toBeNull();
      expect(screen.queryByText("ADD")).toBeNull();
    });

    test("active category button has correct color class", () => {
      render(<CodonReference />);

      fireEvent.click(screen.getByRole("button", { name: "Control" }));

      const controlButton = screen.getByRole("button", { name: "Control" });
      expect(controlButton.className).toContain(CATEGORY_COLORS.control);
      expect(controlButton.className).toContain("text-white");
    });

    test("inactive category buttons have muted styling", () => {
      render(<CodonReference />);

      // All is active by default, so Control should be inactive
      const controlButton = screen.getByRole("button", { name: "Control" });
      expect(controlButton.className).toContain("bg-bg-light");
      expect(controlButton.className).toContain("text-text-muted");
    });

    test("can switch between categories", () => {
      render(<CodonReference />);

      // Click Control
      fireEvent.click(screen.getByRole("button", { name: "Control" }));
      expect(screen.getByText("START")).toBeDefined();
      expect(screen.queryByText("CIRCLE")).toBeNull();

      // Switch to Math
      fireEvent.click(screen.getByRole("button", { name: "Math" }));
      expect(screen.getByText("ADD")).toBeDefined();
      expect(screen.queryByText("START")).toBeNull();
    });
  });

  describe("opcode/codon display", () => {
    test("shows opcode names", () => {
      render(<CodonReference />);
      expect(screen.getByText("START")).toBeDefined();
      expect(screen.getByText("CIRCLE")).toBeDefined();
      expect(screen.getByText("ADD")).toBeDefined();
    });

    test("shows opcode descriptions", () => {
      render(<CodonReference />);
      expect(screen.getByText("Begin execution (ATG only)")).toBeDefined();
      expect(
        screen.getByText("Draw circle with radius from stack"),
      ).toBeDefined();
    });

    test("shows codon buttons with correct title", () => {
      render(<CodonReference />);
      const atgButton = screen.getByTitle("Click to insert ATG");
      expect(atgButton).toBeDefined();
      expect(atgButton.textContent).toBe("ATG");
    });

    test("clicking codon calls onInsert with codon string", () => {
      const onInsert = mock(() => {});
      render(<CodonReference onInsert={onInsert} />);

      const atgButton = screen.getByTitle("Click to insert ATG");
      fireEvent.click(atgButton);

      expect(onInsert).toHaveBeenCalledTimes(1);
      expect(onInsert).toHaveBeenCalledWith("ATG");
    });

    test("codon buttons have monospace font", () => {
      render(<CodonReference />);
      const atgButton = screen.getByTitle("Click to insert ATG");
      expect(atgButton.className).toContain("font-mono");
    });

    test("opcode name has monospace font", () => {
      render(<CodonReference />);
      const startOpcode = screen.getByText("START");
      expect(startOpcode.className).toContain("font-mono");
    });

    test("category color indicator is shown for each opcode", () => {
      render(<CodonReference />);

      // Filter to control only for easier testing
      fireEvent.click(screen.getByRole("button", { name: "Control" }));

      // Find START opcode container and check for color indicator
      const startText = screen.getByText("START");
      const container = startText.parentElement;
      const colorIndicator = container?.querySelector("span.rounded-full");
      expect(colorIndicator).toBeDefined();
      expect(colorIndicator?.className).toContain(CATEGORY_COLORS.control);
    });
  });

  describe("empty state", () => {
    test("shows 'No matching codons found' when search has no results", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");

      fireEvent.change(input, { target: { value: "xyznonexistent" } });

      expect(screen.getByText("No matching codons found")).toBeDefined();
    });

    test("empty state is hidden when results exist", () => {
      render(<CodonReference />);
      expect(screen.queryByText("No matching codons found")).toBeNull();
    });
  });

  describe("footer", () => {
    test("shows 'Click a codon to insert it at cursor'", () => {
      render(<CodonReference />);
      expect(
        screen.getByText("Click a codon to insert it at cursor"),
      ).toBeDefined();
    });
  });

  describe("combined filtering", () => {
    test("search and category filters work together", () => {
      render(<CodonReference />);

      // Select Drawing category
      fireEvent.click(screen.getByRole("button", { name: "Drawing" }));

      // Search within drawing
      const input = screen.getByPlaceholderText("Search codons...");
      fireEvent.change(input, { target: { value: "circle" } });

      // Should show CIRCLE
      expect(screen.getByText("CIRCLE")).toBeDefined();

      // Should not show other drawing opcodes
      expect(screen.queryByText("RECT")).toBeNull();
      expect(screen.queryByText("LINE")).toBeNull();
    });
  });

  describe("styling", () => {
    test("expanded panel has correct width class", () => {
      const { container } = render(<CodonReference />);
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain("w-72");
    });

    test("collapsed button has correct width class", () => {
      const { container } = render(<CodonReference collapsed={true} />);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toContain("w-10");
    });

    test("search input has proper styling", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");
      expect(input.className).toContain("rounded-md");
      expect(input.className).toContain("border");
      expect(input.className).toContain("text-sm");
    });
  });

  describe("onInsert callback behavior", () => {
    test("does not throw when onInsert is undefined", () => {
      render(<CodonReference />);
      const atgButton = screen.getByTitle("Click to insert ATG");
      // Should not throw
      expect(() => fireEvent.click(atgButton)).not.toThrow();
    });

    test("multiple codon clicks call onInsert multiple times", () => {
      const onInsert = mock(() => {});
      render(<CodonReference onInsert={onInsert} />);

      const atgButton = screen.getByTitle("Click to insert ATG");
      fireEvent.click(atgButton);
      fireEvent.click(atgButton);

      expect(onInsert).toHaveBeenCalledTimes(2);
    });
  });

  describe("accessibility", () => {
    test("all buttons have type='button'", () => {
      render(<CodonReference onToggleCollapse={() => {}} />);
      const buttons = screen.getAllByRole("button");
      for (const button of buttons) {
        expect(button.getAttribute("type")).toBe("button");
      }
    });

    test("collapsed button is focusable", () => {
      render(<CodonReference collapsed={true} />);
      const button = screen.getByRole("button");
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    test("search input is focusable", () => {
      render(<CodonReference />);
      const input = screen.getByPlaceholderText("Search codons...");
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });
});
