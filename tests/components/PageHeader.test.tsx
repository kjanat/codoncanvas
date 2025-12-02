import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";

import { PageHeader } from "@/components/PageHeader";

afterEach(() => cleanup());

describe("PageHeader", () => {
  test("renders title as h1", () => {
    render(<PageHeader title="Test Title" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toContain("Test Title");
  });

  test("renders subtitle when provided", () => {
    render(<PageHeader subtitle="Test subtitle text" title="Title" />);

    const subtitle = screen.getByText("Test subtitle text");
    expect(subtitle).toBeDefined();
    expect(subtitle.tagName).toBe("P");
    expect(subtitle.className).toContain("text-text-muted");
  });

  test("does not render subtitle paragraph when not provided", () => {
    const { container } = render(<PageHeader title="Title" />);

    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(0);
  });

  test("default align is center (text-center class)", () => {
    const { container } = render(<PageHeader title="Title" />);

    const textContainer = container.querySelector(".text-center");
    expect(textContainer).toBeDefined();
    expect(textContainer).not.toBeNull();
  });

  test("align='left' applies text-left class", () => {
    const { container } = render(<PageHeader align="left" title="Title" />);

    const textContainer = container.querySelector(".text-left");
    expect(textContainer).toBeDefined();
    expect(textContainer).not.toBeNull();

    const centerContainer = container.querySelector(".text-center");
    expect(centerContainer).toBeNull();
  });

  test("renders badge next to title when provided", () => {
    render(
      <PageHeader
        badge={<span data-testid="badge">Beta</span>}
        title="Title"
      />,
    );

    const badge = screen.getByTestId("badge");
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe("Beta");

    // Badge should be wrapped in a span with ml-3 class
    const badgeWrapper = badge.parentElement;
    expect(badgeWrapper?.className).toContain("ml-3");
  });

  test("does not render badge span when not provided", () => {
    render(<PageHeader title="Title" />);

    const heading = screen.getByRole("heading", { level: 1 });
    const badgeSpan = heading.querySelector("span.ml-3");
    expect(badgeSpan).toBeNull();
  });

  test("renders actions when provided", () => {
    render(
      <PageHeader
        actions={
          <button data-testid="action-btn" type="button">
            Click me
          </button>
        }
        title="Title"
      />,
    );

    const actionBtn = screen.getByTestId("action-btn");
    expect(actionBtn).toBeDefined();

    // Actions should be wrapped in a flex container
    const actionsWrapper = actionBtn.parentElement;
    expect(actionsWrapper?.className).toContain("flex");
    expect(actionsWrapper?.className).toContain("gap-2");
  });

  test("does not render actions div when not provided", () => {
    const { container } = render(<PageHeader title="Title" />);

    // The only div with flex class should not exist for actions
    const flexDivs = container.querySelectorAll("div.flex.gap-2");
    expect(flexDivs.length).toBe(0);
  });

  test("container has flex layout when align='left' and actions provided", () => {
    const { container } = render(
      <PageHeader
        actions={<button type="button">Action</button>}
        align="left"
        title="Title"
      />,
    );

    const outerContainer = container.firstElementChild;
    expect(outerContainer?.className).toContain("flex");
    expect(outerContainer?.className).toContain("flex-col");
    expect(outerContainer?.className).toContain("sm:flex-row");
    expect(outerContainer?.className).toContain("sm:items-center");
    expect(outerContainer?.className).toContain("sm:justify-between");
  });

  test("container does not have flex layout when align='center' with actions", () => {
    const { container } = render(
      <PageHeader
        actions={<button type="button">Action</button>}
        align="center"
        title="Title"
      />,
    );

    const outerContainer = container.firstElementChild;
    expect(outerContainer?.className).not.toContain("sm:justify-between");
  });

  test("container does not have flex layout when align='left' without actions", () => {
    const { container } = render(<PageHeader align="left" title="Title" />);

    const outerContainer = container.firstElementChild;
    expect(outerContainer?.className).not.toContain("sm:justify-between");
  });
});
