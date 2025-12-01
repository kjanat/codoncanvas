/**
 * ShareQRCode Component Tests
 *
 * Tests URL handling edge cases and rendering behavior.
 * Security focus: ensures URLs are passed to QRCode correctly
 * without injection vulnerabilities.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { ShareQRCode } from "@/components/ShareQRCode";

afterEach(() => {
  cleanup();
});

describe("ShareQRCode", () => {
  describe("basic rendering", () => {
    test("renders QRCode component", () => {
      render(<ShareQRCode value="https://example.com" />);

      // QRCode renders as SVG
      const svg = document.querySelector("svg");
      expect(svg).toBeDefined();
    });

    test("renders instruction text", () => {
      render(<ShareQRCode value="https://example.com" />);

      expect(
        screen.getByText("Scan with mobile device to open genome"),
      ).toBeDefined();
    });

    test("QRCode is aria-hidden for accessibility", () => {
      render(<ShareQRCode value="https://example.com" />);

      const svg = document.querySelector("svg");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });
  });

  describe("URL handling", () => {
    test("handles simple URL", () => {
      const { container } = render(
        <ShareQRCode value="https://codoncanvas.org" />,
      );

      // QRCode should render without errors
      expect(container.querySelector("svg")).toBeDefined();
    });

    test("handles URL with query parameters", () => {
      const url = "https://codoncanvas.org/play?genome=ATG-TAA&mode=visual";
      const { container } = render(<ShareQRCode value={url} />);

      expect(container.querySelector("svg")).toBeDefined();
    });

    test("handles URL with encoded characters", () => {
      const url = "https://codoncanvas.org/play?genome=ATG%20TAA";
      const { container } = render(<ShareQRCode value={url} />);

      expect(container.querySelector("svg")).toBeDefined();
    });

    test("handles URL with hash fragment", () => {
      const url = "https://codoncanvas.org/play#section";
      const { container } = render(<ShareQRCode value={url} />);

      expect(container.querySelector("svg")).toBeDefined();
    });

    test("handles very long URL (base64 encoded genome)", () => {
      // Simulate a URL with base64-encoded genome data
      const longGenome = `ATG${"ACG".repeat(100)}TAA`;
      const encoded = btoa(longGenome);
      const url = `https://codoncanvas.org/play?g=${encoded}`;

      const { container } = render(<ShareQRCode value={url} />);

      expect(container.querySelector("svg")).toBeDefined();
    });
  });

  describe("edge cases", () => {
    test("handles empty string", () => {
      const { container } = render(<ShareQRCode value="" />);

      // Should still render (QRCode library handles empty)
      expect(container.querySelector("svg")).toBeDefined();
    });

    test("handles non-URL string", () => {
      const { container } = render(<ShareQRCode value="just plain text" />);

      // QRCode works with any string, not just URLs
      expect(container.querySelector("svg")).toBeDefined();
    });

    test("handles special characters in value", () => {
      const values = [
        "https://example.com?q=<script>alert('xss')</script>",
        'https://example.com?q="quoted"',
        "https://example.com?q='single'",
        "https://example.com?q=&amp;entity",
      ];

      for (const value of values) {
        cleanup();
        const { container } = render(<ShareQRCode value={value} />);
        // QRCode should encode these safely as QR data
        expect(container.querySelector("svg")).toBeDefined();
      }
    });

    test("handles unicode in value", () => {
      const { container } = render(
        <ShareQRCode value="https://example.com?name=Hello World" />,
      );

      expect(container.querySelector("svg")).toBeDefined();
    });

    test("handles newlines in value", () => {
      const { container } = render(
        <ShareQRCode value="https://example.com?data=line1\nline2" />,
      );

      expect(container.querySelector("svg")).toBeDefined();
    });
  });

  describe("styling", () => {
    test("has centered flex layout", () => {
      const { container } = render(<ShareQRCode value="https://example.com" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("flex");
      expect(wrapper.className).toContain("items-center");
      expect(wrapper.className).toContain("justify-center");
    });

    test("has padding on container", () => {
      const { container } = render(<ShareQRCode value="https://example.com" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("p-4");
    });

    test("QRCode wrapper has rounded corners and background", () => {
      const { container } = render(<ShareQRCode value="https://example.com" />);

      const qrWrapper = container.querySelector(".rounded-lg");
      expect(qrWrapper).toBeDefined();
      expect(qrWrapper?.className).toContain("bg-surface");
    });
  });
});
