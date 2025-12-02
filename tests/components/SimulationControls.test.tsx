import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SimulationControls } from "@/components/SimulationControls";

afterEach(() => cleanup());

describe("SimulationControls", () => {
  const defaultProps = {
    isRunning: false,
    onToggle: mock(() => {}),
    onStep: mock(() => {}),
    onReset: mock(() => {}),
  };

  describe("Run/Pause button label", () => {
    test("renders 'Run' when isRunning=false", () => {
      render(<SimulationControls {...defaultProps} isRunning={false} />);
      expect(screen.getByRole("button", { name: "Run" })).toBeDefined();
    });

    test("renders 'Pause' when isRunning=true", () => {
      render(<SimulationControls {...defaultProps} isRunning={true} />);
      expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();
    });

    test("uses custom runLabel when provided", () => {
      render(
        <SimulationControls
          {...defaultProps}
          isRunning={false}
          runLabel="Start"
        />,
      );
      expect(screen.getByRole("button", { name: "Start" })).toBeDefined();
      expect(screen.queryByRole("button", { name: "Run" })).toBeNull();
    });

    test("uses custom pauseLabel when provided", () => {
      render(
        <SimulationControls
          {...defaultProps}
          isRunning={true}
          pauseLabel="Stop"
        />,
      );
      expect(screen.getByRole("button", { name: "Stop" })).toBeDefined();
      expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
    });
  });

  describe("button callbacks", () => {
    test("onToggle is called when Run/Pause button clicked", () => {
      const onToggle = mock(() => {});
      render(<SimulationControls {...defaultProps} onToggle={onToggle} />);

      fireEvent.click(screen.getByRole("button", { name: "Run" }));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test("onStep is called when Step button clicked", () => {
      const onStep = mock(() => {});
      render(<SimulationControls {...defaultProps} onStep={onStep} />);

      fireEvent.click(screen.getByRole("button", { name: "Step" }));

      expect(onStep).toHaveBeenCalledTimes(1);
    });

    test("onReset is called when Reset button clicked", () => {
      const onReset = mock(() => {});
      render(<SimulationControls {...defaultProps} onReset={onReset} />);

      fireEvent.click(screen.getByRole("button", { name: "Reset" }));

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Step button disabled state", () => {
    test("Step button is disabled when isRunning=true", () => {
      render(<SimulationControls {...defaultProps} isRunning={true} />);
      const stepButton = screen.getByRole("button", {
        name: "Step",
      }) as HTMLButtonElement;
      expect(stepButton.disabled).toBe(true);
    });

    test("Step button is disabled when stepDisabled=true", () => {
      render(
        <SimulationControls
          {...defaultProps}
          isRunning={false}
          stepDisabled={true}
        />,
      );
      const stepButton = screen.getByRole("button", {
        name: "Step",
      }) as HTMLButtonElement;
      expect(stepButton.disabled).toBe(true);
    });

    test("Step button is enabled when isRunning=false and stepDisabled=false", () => {
      render(
        <SimulationControls
          {...defaultProps}
          isRunning={false}
          stepDisabled={false}
        />,
      );
      const stepButton = screen.getByRole("button", {
        name: "Step",
      }) as HTMLButtonElement;
      expect(stepButton.disabled).toBe(false);
    });

    test("Step button is enabled when isRunning=false and stepDisabled=undefined", () => {
      render(<SimulationControls {...defaultProps} isRunning={false} />);
      const stepButton = screen.getByRole("button", {
        name: "Step",
      }) as HTMLButtonElement;
      expect(stepButton.disabled).toBe(false);
    });

    test("stepDisabled=true overrides isRunning=false", () => {
      const onStep = mock(() => {});
      render(
        <SimulationControls
          {...defaultProps}
          isRunning={false}
          onStep={onStep}
          stepDisabled={true}
        />,
      );
      const stepButton = screen.getByRole("button", {
        name: "Step",
      }) as HTMLButtonElement;
      expect(stepButton.disabled).toBe(true);

      // Attempt click on disabled button - should not call handler
      fireEvent.click(stepButton);
      expect(onStep).not.toHaveBeenCalled();
    });
  });

  describe("children rendering", () => {
    test("renders children when provided", () => {
      render(
        <SimulationControls {...defaultProps}>
          <button type="button">Custom Button</button>
        </SimulationControls>,
      );
      expect(
        screen.getByRole("button", { name: "Custom Button" }),
      ).toBeDefined();
    });

    test("renders multiple children", () => {
      render(
        <SimulationControls {...defaultProps}>
          <button type="button">Extra 1</button>
          <button type="button">Extra 2</button>
        </SimulationControls>,
      );
      expect(screen.getByRole("button", { name: "Extra 1" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Extra 2" })).toBeDefined();
    });

    test("renders without children", () => {
      render(<SimulationControls {...defaultProps} />);
      // Should have exactly 3 buttons: Run, Step, Reset
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("button structure", () => {
    test("renders all three control buttons", () => {
      render(<SimulationControls {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Run" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Step" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Reset" })).toBeDefined();
    });

    test("Reset button is always enabled regardless of isRunning", () => {
      render(<SimulationControls {...defaultProps} isRunning={true} />);
      const resetButton = screen.getByRole("button", {
        name: "Reset",
      }) as HTMLButtonElement;
      expect(resetButton.disabled).toBe(false);
    });
  });
});
