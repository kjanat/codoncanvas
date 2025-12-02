/**
 * Tests for icon components
 *
 * Ensures all icons render correctly with default and custom classNames.
 */

import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";

// Actions
import {
  CheckIcon,
  CloseIcon,
  ErrorIcon,
  WarningIcon,
} from "@/ui/icons/actions";
// Brand
import { DnaIcon, GitHubIcon } from "@/ui/icons/brand";
// Media
import { GalleryIcon } from "@/ui/icons/media";
// Navigation
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  RewindIcon,
} from "@/ui/icons/navigation";
// Theme
import { MoonIcon, SunIcon, SystemIcon } from "@/ui/icons/theme";

describe("Action Icons", () => {
  test("CloseIcon renders with default className", () => {
    const { container } = render(<CloseIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-4 w-4");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  test("CloseIcon renders with custom className", () => {
    const { container } = render(
      <CloseIcon className="h-6 w-6 text-red-500" />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toBe("h-6 w-6 text-red-500");
  });

  test("CheckIcon renders with default className", () => {
    const { container } = render(<CheckIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-4 w-4");
  });

  test("CheckIcon renders with custom className", () => {
    const { container } = render(<CheckIcon className="h-8 w-8" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-8 w-8",
    );
  });

  test("ErrorIcon renders with default className", () => {
    const { container } = render(<ErrorIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-4 w-4");
  });

  test("ErrorIcon renders with custom className", () => {
    const { container } = render(<ErrorIcon className="h-10 w-10" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-10 w-10",
    );
  });

  test("WarningIcon renders with default className", () => {
    const { container } = render(<WarningIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-8 w-8");
  });

  test("WarningIcon renders with custom className", () => {
    const { container } = render(<WarningIcon className="h-12 w-12" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-12 w-12",
    );
  });
});

describe("Brand Icons", () => {
  test("GitHubIcon renders with default className", () => {
    const { container } = render(<GitHubIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("GitHubIcon renders with custom className", () => {
    const { container } = render(<GitHubIcon className="h-8 w-8" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-8 w-8",
    );
  });

  test("DnaIcon renders with default className", () => {
    const { container } = render(<DnaIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-12 w-12");
  });

  test("DnaIcon renders with custom className", () => {
    const { container } = render(<DnaIcon className="h-16 w-16" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-16 w-16",
    );
  });
});

describe("Media Icons", () => {
  test("GalleryIcon renders with default className", () => {
    const { container } = render(<GalleryIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("GalleryIcon renders with custom className", () => {
    const { container } = render(<GalleryIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-6 w-6",
    );
  });
});

describe("Navigation Icons", () => {
  test("ChevronDownIcon renders with default className", () => {
    const { container } = render(<ChevronDownIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-4 w-4");
  });

  test("ChevronDownIcon renders with custom className", () => {
    const { container } = render(<ChevronDownIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-6 w-6",
    );
  });

  test("ChevronLeftIcon renders with default className", () => {
    const { container } = render(<ChevronLeftIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("ChevronLeftIcon renders with custom className", () => {
    const { container } = render(<ChevronLeftIcon className="h-8 w-8" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-8 w-8",
    );
  });

  test("ChevronRightIcon renders with default className", () => {
    const { container } = render(<ChevronRightIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("ChevronRightIcon renders with custom className", () => {
    const { container } = render(<ChevronRightIcon className="h-8 w-8" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-8 w-8",
    );
  });

  test("HomeIcon renders with default className", () => {
    const { container } = render(<HomeIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("HomeIcon renders with custom className", () => {
    const { container } = render(<HomeIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-6 w-6",
    );
  });

  test("RewindIcon renders with default className", () => {
    const { container } = render(<RewindIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("RewindIcon renders with custom className", () => {
    const { container } = render(<RewindIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-6 w-6",
    );
  });
});

describe("Theme Icons", () => {
  test("SunIcon renders with default className", () => {
    const { container } = render(<SunIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("SunIcon renders with custom className", () => {
    const { container } = render(<SunIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-6 w-6",
    );
  });

  test("MoonIcon renders with default className", () => {
    const { container } = render(<MoonIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("MoonIcon renders with custom className", () => {
    const { container } = render(<MoonIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-6 w-6",
    );
  });

  test("SystemIcon renders with default className", () => {
    const { container } = render(<SystemIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("h-5 w-5");
  });

  test("SystemIcon renders with custom className", () => {
    const { container } = render(<SystemIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "h-6 w-6",
    );
  });
});
