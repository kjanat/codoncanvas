import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { PageContainer } from "@/components/PageContainer";

afterEach(() => cleanup());

describe("PageContainer", () => {
  test("renders children", () => {
    render(
      <PageContainer>
        <span data-testid="child">Hello World</span>
      </PageContainer>,
    );

    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Hello World")).toBeDefined();
  });

  test("default maxWidth is 7xl", () => {
    render(<PageContainer data-testid="container">Content</PageContainer>);

    const container = screen.getByTestId("container");
    expect(container.className).toContain("max-w-7xl");
  });

  describe("maxWidth variants", () => {
    const maxWidthCases: Array<{
      value: "sm" | "md" | "lg" | "xl" | "7xl" | "full";
      expectedClass: string;
    }> = [
      { value: "sm", expectedClass: "max-w-sm" },
      { value: "md", expectedClass: "max-w-md" },
      { value: "lg", expectedClass: "max-w-lg" },
      { value: "xl", expectedClass: "max-w-xl" },
      { value: "7xl", expectedClass: "max-w-7xl" },
      { value: "full", expectedClass: "max-w-full" },
    ];

    for (const { value, expectedClass } of maxWidthCases) {
      test(`maxWidth="${value}" applies ${expectedClass}`, () => {
        render(
          <PageContainer data-testid="container" maxWidth={value}>
            Content
          </PageContainer>,
        );

        const container = screen.getByTestId("container");
        expect(container.className).toContain(expectedClass);
      });
    }
  });

  test("has mx-auto class for centering", () => {
    render(<PageContainer data-testid="container">Content</PageContainer>);

    const container = screen.getByTestId("container");
    expect(container.className).toContain("mx-auto");
  });

  test("has px-4 and py-8 for padding", () => {
    render(<PageContainer data-testid="container">Content</PageContainer>);

    const container = screen.getByTestId("container");
    expect(container.className).toContain("px-4");
    expect(container.className).toContain("py-8");
  });

  test("custom className is appended", () => {
    render(
      <PageContainer
        className="custom-class another-class"
        data-testid="container"
      >
        Content
      </PageContainer>,
    );

    const container = screen.getByTestId("container");
    expect(container.className).toContain("custom-class");
    expect(container.className).toContain("another-class");
    // Should still have default classes
    expect(container.className).toContain("mx-auto");
    expect(container.className).toContain("max-w-7xl");
  });

  test("passes through HTML attributes", () => {
    render(
      <PageContainer
        aria-label="Main content"
        data-testid="container"
        id="main-container"
        role="main"
      >
        Content
      </PageContainer>,
    );

    const container = screen.getByTestId("container");
    expect(container.id).toBe("main-container");
    expect(container.getAttribute("aria-label")).toBe("Main content");
    expect(container.getAttribute("role")).toBe("main");
  });

  test("renders as div element", () => {
    render(<PageContainer data-testid="container">Content</PageContainer>);

    const container = screen.getByTestId("container");
    expect(container.tagName).toBe("DIV");
  });

  test("handles empty className gracefully", () => {
    render(
      <PageContainer className="" data-testid="container">
        Content
      </PageContainer>,
    );

    const container = screen.getByTestId("container");
    // Should not have trailing/leading spaces or double spaces
    expect(container.className).not.toMatch(/\s{2,}/);
    expect(container.className).not.toMatch(/^\s|\s$/);
  });

  test("renders multiple children", () => {
    render(
      <PageContainer data-testid="container">
        <header data-testid="header">Header</header>
        <main data-testid="main">Main</main>
        <footer data-testid="footer">Footer</footer>
      </PageContainer>,
    );

    expect(screen.getByTestId("header")).toBeDefined();
    expect(screen.getByTestId("main")).toBeDefined();
    expect(screen.getByTestId("footer")).toBeDefined();
  });
});
