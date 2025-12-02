/**
 * Card Component Tests
 */

import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { Card, CardHeader } from "@/components/Card";

afterEach(() => cleanup());

describe("Card", () => {
  test("renders children", () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText("Test content")).toBeDefined();
  });

  test("default padding is md (p-6)", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveProperty("className");
    expect((container.firstChild as HTMLElement).className).toContain("p-6");
  });

  test("padding sm applies p-4", () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("p-4");
  });

  test("padding md applies p-6", () => {
    const { container } = render(<Card padding="md">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("p-6");
  });

  test("padding lg applies p-8", () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("p-8");
  });

  test("padding xl applies p-12", () => {
    const { container } = render(<Card padding="xl">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("p-12");
  });

  test("hoverable adds hover:shadow-md class", () => {
    const { container } = render(<Card hoverable>Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain(
      "hover:shadow-md",
    );
  });

  test("interactive adds role=button and tabIndex=0", () => {
    render(<Card interactive>Content</Card>);
    const card = screen.getByRole("button");
    expect(card).toBeDefined();
    expect(card.getAttribute("tabindex")).toBe("0");
  });

  test("onClick adds role=button and tabIndex=0 automatically", () => {
    const handleClick = mock(() => {});
    render(<Card onClick={handleClick}>Content</Card>);
    const card = screen.getByRole("button");
    expect(card).toBeDefined();
    expect(card.getAttribute("tabindex")).toBe("0");
  });

  test("click handler fires on click", () => {
    const handleClick = mock(() => {});
    render(<Card onClick={handleClick}>Content</Card>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("Enter key triggers onClick", () => {
    const handleClick = mock(() => {});
    render(<Card onClick={handleClick}>Content</Card>);

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("Space key triggers onClick", () => {
    const handleClick = mock(() => {});
    render(<Card onClick={handleClick}>Content</Card>);

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("custom className is merged", () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("custom-class");
    expect(card.className).toContain("rounded-xl"); // base class still present
  });

  test("can override role", () => {
    render(
      <Card interactive role="region">
        Content
      </Card>,
    );
    expect(screen.getByRole("region")).toBeDefined();
  });

  test("can override tabIndex", () => {
    render(
      <Card interactive tabIndex={-1}>
        Content
      </Card>,
    );
    const card = screen.getByRole("button");
    expect(card.getAttribute("tabindex")).toBe("-1");
  });

  test("passes through other HTML attributes", () => {
    render(
      <Card aria-label="Test card" data-testid="test-card">
        Content
      </Card>,
    );
    const card = screen.getByTestId("test-card");
    expect(card).toBeDefined();
    expect(card.getAttribute("aria-label")).toBe("Test card");
  });

  test("interactive card has cursor-pointer class", () => {
    const { container } = render(<Card interactive>Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain(
      "cursor-pointer",
    );
  });

  test("interactive card has hover:border-primary class", () => {
    const { container } = render(<Card interactive>Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain(
      "hover:border-primary",
    );
  });

  test("hoverable without interactive does not add cursor-pointer", () => {
    const { container } = render(<Card hoverable>Content</Card>);
    expect((container.firstChild as HTMLElement).className).not.toContain(
      "cursor-pointer",
    );
  });

  test("onKeyDown is called alongside built-in handler", () => {
    const handleClick = mock(() => {});
    const handleKeyDown = mock(() => {});
    render(
      <Card onClick={handleClick} onKeyDown={handleKeyDown}>
        Content
      </Card>,
    );

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });
});

describe("CardHeader", () => {
  test("renders title", () => {
    render(<CardHeader title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeDefined();
  });

  test("renders subtitle when provided", () => {
    render(<CardHeader subtitle="Test Subtitle" title="Title" />);
    expect(screen.getByText("Test Subtitle")).toBeDefined();
  });

  test("renders action when provided", () => {
    render(
      <CardHeader
        action={<button type="button">Action</button>}
        title="Title"
      />,
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeDefined();
  });

  test("does not render subtitle element when not provided", () => {
    const { container } = render(<CardHeader title="Title" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(0);
  });

  test("title is rendered as h2", () => {
    render(<CardHeader title="Heading" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toBe("Heading");
  });

  test("title accepts ReactNode", () => {
    render(
      <CardHeader
        title={
          <span>
            <strong>Bold</strong> Title
          </span>
        }
      />,
    );
    expect(screen.getByText("Bold")).toBeDefined();
    expect(screen.getByText("Title", { exact: false })).toBeDefined();
  });

  test("subtitle accepts ReactNode", () => {
    render(
      <CardHeader
        subtitle={
          <span>
            <em>Italic</em> subtitle
          </span>
        }
        title="Title"
      />,
    );
    expect(screen.getByText("Italic")).toBeDefined();
  });
});
