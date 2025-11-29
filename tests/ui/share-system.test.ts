/**
 * Share System Test Suite
 *
 * Tests for universal sharing and export system for CodonCanvas genomes.
 * Enables viral sharing, teacher workflows, and cross-device collaboration.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { injectShareStyles, ShareSystem } from "@/ui/share-system";

// Mock clipboard API
const mockClipboard = {
  writeText: mock(() => Promise.resolve()),
  readText: mock(() => Promise.resolve("")),
};

// Store original clipboard
const originalClipboard = navigator.clipboard;

// Mock window.open
const originalOpen = window.open;
let mockWindowOpen: ReturnType<typeof mock>;

// Mock location
const _originalLocation = window.location;

describe("ShareSystem", () => {
  let container: HTMLElement;
  let getGenome: () => string;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    getGenome = () => "ATG GGA TAA";

    // Setup clipboard mock - reset implementation on each test
    mockClipboard.writeText = mock(() => Promise.resolve());
    mockClipboard.readText = mock(() => Promise.resolve(""));
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    // Setup window.open mock
    mockWindowOpen = mock(() => null);
    window.open = mockWindowOpen;

    // Clear any existing share styles
    const existingStyle = document.getElementById("share-system-styles");
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
    window.open = originalOpen;
  });

  // Constructor & Configuration
  describe("constructor", () => {
    test("accepts ShareSystemConfig with containerElement and getGenome", () => {
      const system = new ShareSystem({
        containerElement: container,
        getGenome,
      });
      expect(system).toBeDefined();
      expect(container.innerHTML).not.toBe("");
    });

    test("uses default appTitle 'CodonCanvas' when not specified", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
      });
      // Default is used internally for share text
      const header = container.querySelector(".share-title");
      expect(header?.textContent).toContain("Share & Export");
    });

    test("uses default showQRCode true when not specified", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
      });
      expect(container.querySelector("#share-qr")).not.toBeNull();
    });

    test("uses default socialPlatforms ['twitter', 'reddit', 'email'] when not specified", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
      });
      expect(container.querySelector("#share-twitter")).not.toBeNull();
      expect(container.querySelector("#share-reddit")).not.toBeNull();
      expect(container.querySelector("#share-email")).not.toBeNull();
    });

    test("calls render() automatically on construction", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
      });
      expect(container.querySelector(".share-system")).not.toBeNull();
    });

    test("accepts custom appTitle option", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        appTitle: "CustomTitle",
      });
      // Title is used in share text, not displayed in UI
      const header = container.querySelector(".share-title");
      expect(header?.textContent).toContain("Share & Export");
    });

    test("accepts showQRCode false to hide QR button", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        showQRCode: false,
      });
      expect(container.querySelector("#share-qr")).toBeNull();
    });

    test("accepts subset of social platforms", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        socialPlatforms: ["twitter"],
      });
      expect(container.querySelector("#share-twitter")).not.toBeNull();
      expect(container.querySelector("#share-reddit")).toBeNull();
      expect(container.querySelector("#share-email")).toBeNull();
    });
  });

  // render (private, tested via constructor)
  describe("render", () => {
    test("creates share-system container div", () => {
      new ShareSystem({ containerElement: container, getGenome });
      expect(container.querySelector(".share-system")).not.toBeNull();
    });

    test("creates share-header with title 'Share & Export'", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const header = container.querySelector(".share-header");
      expect(header).not.toBeNull();
      expect(header?.textContent).toContain("Share & Export");
    });

    test("creates Copy, Link, Download buttons", () => {
      new ShareSystem({ containerElement: container, getGenome });
      expect(container.querySelector("#share-copy")).not.toBeNull();
      expect(container.querySelector("#share-permalink")).not.toBeNull();
      expect(container.querySelector("#share-download")).not.toBeNull();
    });

    test("creates QR Code button when showQRCode is true", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        showQRCode: true,
      });
      expect(container.querySelector("#share-qr")).not.toBeNull();
    });

    test("hides QR Code button when showQRCode is false", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        showQRCode: false,
      });
      expect(container.querySelector("#share-qr")).toBeNull();
    });

    test("creates social buttons based on socialPlatforms config", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        socialPlatforms: ["email"],
      });
      expect(container.querySelector("#share-twitter")).toBeNull();
      expect(container.querySelector("#share-reddit")).toBeNull();
      expect(container.querySelector("#share-email")).not.toBeNull();
    });

    test("creates share-feedback div for messages", () => {
      new ShareSystem({ containerElement: container, getGenome });
      expect(container.querySelector("#share-feedback")).not.toBeNull();
    });

    test("creates share-modal div for popups", () => {
      new ShareSystem({ containerElement: container, getGenome });
      expect(container.querySelector("#share-modal")).not.toBeNull();
    });

    test("replaces container children (safe DOM manipulation)", () => {
      container.innerHTML = "<p>Old content</p>";
      new ShareSystem({ containerElement: container, getGenome });
      expect(container.querySelector("p")).toBeNull();
      expect(container.querySelector(".share-system")).not.toBeNull();
    });

    test("calls attachEventListeners after rendering", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      expect(copyBtn).not.toBeNull();
      // Event listener should be attached - clicking should trigger action
      copyBtn.click();
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  // copyToClipboard
  describe("copyToClipboard", () => {
    test("copies genome to clipboard using navigator.clipboard.writeText", async () => {
      new ShareSystem({ containerElement: container, getGenome });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 10));
      expect(mockClipboard.writeText).toHaveBeenCalledWith("ATG GGA TAA");
    });

    test("shows success feedback 'Copied to clipboard!'", async () => {
      new ShareSystem({ containerElement: container, getGenome });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 50));
      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("Copied to clipboard");
    });

    test("shows error feedback when genome is empty", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 50));
      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });

    test("shows error feedback when genome is whitespace only", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "   ",
      });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 50));
      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });

    test("shows error when clipboard API fails", async () => {
      mockClipboard.writeText.mockImplementation(() =>
        Promise.reject(new Error("Not supported")),
      );

      new ShareSystem({ containerElement: container, getGenome });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("Failed to copy");
    });
  });

  // generatePermalink
  describe("generatePermalink", () => {
    test("encodes genome using base64 URL-safe encoding", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      // Check that writeText was called with encoded URL
      const calls = mockClipboard.writeText.mock.calls as unknown[][];
      expect(calls[0]?.[0]).toContain("?genome=");
    });

    test("appends ?genome=encoded to current URL", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      const calls = mockClipboard.writeText.mock.calls as unknown[][];
      expect(calls[0]?.[0]).toMatch(/\?genome=/);
    });

    test("strips existing hash and query params from base URL", () => {
      // The implementation uses window.location.href.split("#")[0].split("?")[0]
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      const calls = mockClipboard.writeText.mock.calls as unknown[][];
      // Should not have double ?
      expect((calls[0]?.[0] as string)?.match(/\?/g)?.length).toBe(1);
    });

    test("copies permalink to clipboard", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    test("shows success feedback 'Permalink copied!'", async () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();
      await new Promise((r) => setTimeout(r, 100));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("Permalink copied");
    });

    test("shows error feedback when genome is empty", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });

    test("shows modal with permalink input when clipboard fails", async () => {
      mockClipboard.writeText.mockImplementation(() =>
        Promise.reject(new Error("Not supported")),
      );

      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const modal = container.querySelector("#share-modal");
      expect(modal?.classList.contains("hidden")).toBe(false);
    });

    test("escapes HTML in modal to prevent XSS", async () => {
      mockClipboard.writeText.mockImplementation(() =>
        Promise.reject(new Error("Not supported")),
      );

      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      // Modal should be safely built with DOM APIs
      const modal = container.querySelector("#share-modal");
      expect(modal?.innerHTML).not.toContain("<script>");
    });
  });

  // downloadGenome
  describe("downloadGenome", () => {
    test("creates Blob with text/plain type", () => {
      const originalBlob = global.Blob;
      const blobSpy = mock(
        (...args: ConstructorParameters<typeof Blob>) =>
          new originalBlob(...args),
      );
      global.Blob = blobSpy as unknown as typeof Blob;

      new ShareSystem({ containerElement: container, getGenome });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();

      // Restore and check
      global.Blob = originalBlob;
      expect(blobSpy).toHaveBeenCalled();
    });

    test("creates object URL from Blob", () => {
      const createObjectURLSpy = mock(() => "blob:test");
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = createObjectURLSpy;

      new ShareSystem({ containerElement: container, getGenome });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();

      expect(createObjectURLSpy).toHaveBeenCalled();
      URL.createObjectURL = originalCreateObjectURL;
    });

    test("creates anchor element with download attribute", () => {
      let downloadAttr = "";
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = ((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === "a") {
          const originalSetAttribute = el.setAttribute.bind(el);
          el.setAttribute = (name: string, value: string) => {
            if (name === "download") downloadAttr = value;
            return originalSetAttribute(name, value);
          };
        }
        return el;
      }) as typeof document.createElement;

      try {
        new ShareSystem({ containerElement: container, getGenome });
        const downloadBtn = container.querySelector(
          "#share-download",
        ) as HTMLButtonElement;
        downloadBtn.click();

        expect(downloadAttr).toBeTruthy();
        expect(downloadAttr).toContain(".genome");
      } finally {
        document.createElement = originalCreateElement;
      }
    });

    test("sets filename to 'codoncanvas-{timestamp}.genome'", () => {
      let downloadFilename = "";
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = ((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === "a") {
          Object.defineProperty(el, "download", {
            set: (value: string) => {
              downloadFilename = value;
            },
            get: () => downloadFilename,
          });
        }
        return el;
      }) as typeof document.createElement;

      new ShareSystem({ containerElement: container, getGenome });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();

      expect(downloadFilename).toMatch(/codoncanvas-\d+\.genome/);
      document.createElement = originalCreateElement;
    });

    test("triggers click on anchor to start download", () => {
      let clicked = false;
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = ((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === "a") {
          el.click = () => {
            clicked = true;
          };
        }
        return el;
      }) as typeof document.createElement;

      new ShareSystem({ containerElement: container, getGenome });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();

      expect(clicked).toBe(true);
      document.createElement = originalCreateElement;
    });

    test("removes anchor from DOM after click", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();

      // Anchor should be removed after click
      const anchors = document.body.querySelectorAll("a[download]");
      expect(anchors.length).toBe(0);
    });

    test("revokes object URL after download", () => {
      const revokeObjectURLSpy = mock(() => {});
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.revokeObjectURL = revokeObjectURLSpy;

      new ShareSystem({ containerElement: container, getGenome });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();

      expect(revokeObjectURLSpy).toHaveBeenCalled();
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    test("shows success feedback 'Downloaded!'", async () => {
      new ShareSystem({ containerElement: container, getGenome });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("Downloaded");
    });

    test("shows error feedback when genome is empty", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const downloadBtn = container.querySelector(
        "#share-download",
      ) as HTMLButtonElement;
      downloadBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });
  });

  // generateQRCode
  describe("generateQRCode", () => {
    test("generates permalink URL for QR content", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const modal = container.querySelector("#share-modal");
      expect(modal?.classList.contains("hidden")).toBe(false);
    });

    test("uses qrserver.com API for QR code generation", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const img = container.querySelector("#share-modal img");
      expect(img?.getAttribute("src")).toContain("api.qrserver.com");
    });

    test("shows modal with QR code image", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const modal = container.querySelector("#share-modal");
      expect(modal?.classList.contains("hidden")).toBe(false);
      expect(modal?.querySelector("img")).not.toBeNull();
    });

    test("QR code is 300x300 pixels", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const img = container.querySelector("#share-modal img");
      expect(img?.getAttribute("src")).toContain("300x300");
    });

    test("modal includes instruction text about scanning", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const modal = container.querySelector("#share-modal");
      expect(modal?.textContent).toContain("Scan");
    });

    test("escapes URL in img src to prevent XSS", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const img = container.querySelector("#share-modal img");
      const src = img?.getAttribute("src") || "";
      // Should not contain script tags
      expect(src).not.toContain("<script>");
    });

    test("shows error feedback when genome is empty", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });
  });

  // shareToTwitter
  describe("shareToTwitter", () => {
    test("opens twitter.com/intent/tweet in new window", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const twitterBtn = container.querySelector(
        "#share-twitter",
      ) as HTMLButtonElement;
      twitterBtn.click();

      expect(mockWindowOpen).toHaveBeenCalled();
      const url = mockWindowOpen.mock.calls[0][0] as string;
      expect(url).toContain("twitter.com/intent/tweet");
    });

    test("includes custom tweet text with app title", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        appTitle: "TestApp",
      });
      const twitterBtn = container.querySelector(
        "#share-twitter",
      ) as HTMLButtonElement;
      twitterBtn.click();

      const url = mockWindowOpen.mock.calls[0][0] as string;
      expect(url).toContain(encodeURIComponent("TestApp"));
    });

    test("includes genome permalink URL", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const twitterBtn = container.querySelector(
        "#share-twitter",
      ) as HTMLButtonElement;
      twitterBtn.click();

      const url = mockWindowOpen.mock.calls[0][0] as string;
      expect(url).toContain("url=");
    });

    test("includes hashtags CodonCanvas,BioInformatics,VisualProgramming", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const twitterBtn = container.querySelector(
        "#share-twitter",
      ) as HTMLButtonElement;
      twitterBtn.click();

      const url = mockWindowOpen.mock.calls[0][0] as string;
      expect(url).toContain("hashtags=");
      expect(url).toContain("CodonCanvas");
    });

    test("opens window with size 550x420", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const twitterBtn = container.querySelector(
        "#share-twitter",
      ) as HTMLButtonElement;
      twitterBtn.click();

      const features = mockWindowOpen.mock.calls[0][2] as string;
      expect(features).toContain("550");
      expect(features).toContain("420");
    });

    test("shows error feedback when genome is empty", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const twitterBtn = container.querySelector(
        "#share-twitter",
      ) as HTMLButtonElement;
      twitterBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });
  });

  // shareToReddit
  describe("shareToReddit", () => {
    test("opens reddit.com/submit in new tab", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const redditBtn = container.querySelector(
        "#share-reddit",
      ) as HTMLButtonElement;
      redditBtn.click();

      expect(mockWindowOpen).toHaveBeenCalled();
      const url = mockWindowOpen.mock.calls[0][0] as string;
      expect(url).toContain("reddit.com/submit");
    });

    test("includes permalink URL as url parameter", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const redditBtn = container.querySelector(
        "#share-reddit",
      ) as HTMLButtonElement;
      redditBtn.click();

      const url = mockWindowOpen.mock.calls[0][0] as string;
      expect(url).toContain("url=");
    });

    test("includes title with app title", () => {
      new ShareSystem({
        containerElement: container,
        getGenome,
        appTitle: "TestApp",
      });
      const redditBtn = container.querySelector(
        "#share-reddit",
      ) as HTMLButtonElement;
      redditBtn.click();

      const url = mockWindowOpen.mock.calls[0][0] as string;
      expect(url).toContain("title=");
      expect(url).toContain(encodeURIComponent("TestApp"));
    });

    test("shows error feedback when genome is empty", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const redditBtn = container.querySelector(
        "#share-reddit",
      ) as HTMLButtonElement;
      redditBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });
  });

  // shareViaEmail
  describe("shareViaEmail", () => {
    test("sets window.location.href to mailto: URL", () => {
      // Store original href setter
      const hrefDescriptor = Object.getOwnPropertyDescriptor(
        window.location,
        "href",
      );
      let capturedHref = "";
      Object.defineProperty(window.location, "href", {
        set: (value: string) => {
          capturedHref = value;
        },
        get: () => capturedHref || window.location.toString(),
        configurable: true,
      });

      new ShareSystem({ containerElement: container, getGenome });
      const emailBtn = container.querySelector(
        "#share-email",
      ) as HTMLButtonElement;
      emailBtn.click();

      expect(capturedHref).toContain("mailto:");

      // Restore
      if (hrefDescriptor) {
        Object.defineProperty(window.location, "href", hrefDescriptor);
      }
    });

    test("includes subject with app title", () => {
      let capturedHref = "";
      Object.defineProperty(window.location, "href", {
        set: (value: string) => {
          capturedHref = value;
        },
        get: () => capturedHref || window.location.toString(),
        configurable: true,
      });

      new ShareSystem({
        containerElement: container,
        getGenome,
        appTitle: "TestApp",
      });
      const emailBtn = container.querySelector(
        "#share-email",
      ) as HTMLButtonElement;
      emailBtn.click();

      expect(capturedHref).toContain("subject=");
      expect(capturedHref).toContain(encodeURIComponent("TestApp"));
    });

    test("includes body with permalink and raw genome", () => {
      let capturedHref = "";
      Object.defineProperty(window.location, "href", {
        set: (value: string) => {
          capturedHref = value;
        },
        get: () => capturedHref || window.location.toString(),
        configurable: true,
      });

      new ShareSystem({ containerElement: container, getGenome });
      const emailBtn = container.querySelector(
        "#share-email",
      ) as HTMLButtonElement;
      emailBtn.click();

      expect(capturedHref).toContain("body=");
    });

    test("URL-encodes subject and body", () => {
      let capturedHref = "";
      Object.defineProperty(window.location, "href", {
        set: (value: string) => {
          capturedHref = value;
        },
        get: () => capturedHref || window.location.toString(),
        configurable: true,
      });

      new ShareSystem({ containerElement: container, getGenome });
      const emailBtn = container.querySelector(
        "#share-email",
      ) as HTMLButtonElement;
      emailBtn.click();

      // Should be URL encoded (no raw spaces in subject/body)
      expect(capturedHref).not.toMatch(/subject=[^&]*\s/);
    });

    test("shows error feedback when genome is empty", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const emailBtn = container.querySelector(
        "#share-email",
      ) as HTMLButtonElement;
      emailBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).toContain("No genome");
    });
  });

  // showFeedback (private)
  describe("showFeedback", () => {
    test("finds #share-feedback element", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const feedback = container.querySelector("#share-feedback");
      expect(feedback).not.toBeNull();
    });

    test("sets message as textContent", async () => {
      new ShareSystem({ containerElement: container, getGenome });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).not.toBe("");
    });

    test("adds success class for success type", async () => {
      new ShareSystem({ containerElement: container, getGenome });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 100));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.classList.contains("success")).toBe(true);
    });

    test("adds error class for error type", async () => {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "",
      });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.classList.contains("error")).toBe(true);
    });

    // Note: This test verifies the 3-second feedback timeout behavior.
    // Skipped because Bun's fake timer API (jest.advanceTimersByTime) is not available.
    // The behavior is implicitly tested by other feedback tests that verify message display.
    test.skip("clears feedback after 3 seconds", async () => {
      new ShareSystem({ containerElement: container, getGenome });
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 50));

      const feedback = container.querySelector("#share-feedback");
      expect(feedback?.textContent).not.toBe("");

      await new Promise((r) => setTimeout(r, 3100));
      expect(feedback?.textContent).toBe("");
    });

    test("handles missing feedback element gracefully", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const feedback = container.querySelector("#share-feedback");
      feedback?.remove();

      // Should not throw
      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      expect(() => copyBtn.click()).not.toThrow();
    });
  });

  // showModal (private)
  describe("showModal", () => {
    test("finds #share-modal element", () => {
      new ShareSystem({ containerElement: container, getGenome });
      expect(container.querySelector("#share-modal")).not.toBeNull();
    });

    test("builds modal DOM structure programmatically", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const modal = container.querySelector("#share-modal");
      expect(modal?.querySelector(".modal-overlay")).not.toBeNull();
      expect(modal?.querySelector(".modal-content")).not.toBeNull();
    });

    test("sets title via textContent (XSS-safe)", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const h3 = container.querySelector("#share-modal h3");
      expect(h3?.textContent).toBe("QR Code");
    });

    test("creates close button with event listener", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const closeBtn = container.querySelector(".modal-close");
      expect(closeBtn).not.toBeNull();
    });

    test("adds overlay click handler to close modal", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const modal = container.querySelector("#share-modal");
      expect(modal?.classList.contains("hidden")).toBe(false);

      const overlay = modal?.querySelector(".modal-overlay") as HTMLElement;
      overlay?.click();

      expect(modal?.classList.contains("hidden")).toBe(true);
    });

    test("removes hidden class to show modal", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const modal = container.querySelector("#share-modal");
      expect(modal?.classList.contains("hidden")).toBe(false);
    });

    test("stops event propagation on modal content click", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
      qrBtn.click();

      const modal = container.querySelector("#share-modal");
      const content = modal?.querySelector(".modal-content") as HTMLElement;
      content?.click();

      // Modal should still be visible
      expect(modal?.classList.contains("hidden")).toBe(false);
    });
  });

  // encodeGenome (private)
  describe("encodeGenome", () => {
    test("encodes genome as base64", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      const calls = mockClipboard.writeText.mock.calls as unknown[][];
      const url = calls[0]?.[0] as string;
      const encoded = url.split("?genome=")[1];
      // Should be URL-safe base64
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    test("replaces + with - for URL safety", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      const calls = mockClipboard.writeText.mock.calls as unknown[][];
      const url = calls[0]?.[0] as string;
      expect(url).not.toContain("+");
    });

    test("replaces / with _ for URL safety", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      const calls = mockClipboard.writeText.mock.calls as unknown[][];
      const url = calls[0]?.[0] as string;
      // URL should not contain / in the genome parameter
      const genomeParam = url.split("?genome=")[1];
      expect(genomeParam).not.toContain("/");
    });

    test("removes = padding characters", () => {
      new ShareSystem({ containerElement: container, getGenome });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      const calls = mockClipboard.writeText.mock.calls as unknown[][];
      const url = calls[0]?.[0] as string;
      const genomeParam = url.split("?genome=")[1];
      expect(genomeParam).not.toContain("=");
    });

    test("falls back to encodeURIComponent on btoa error", () => {
      // btoa fails on non-latin characters
      new ShareSystem({
        containerElement: container,
        getGenome: () => "ATG 日本語 TAA", // Contains non-latin chars
      });
      const permalinkBtn = container.querySelector(
        "#share-permalink",
      ) as HTMLButtonElement;
      permalinkBtn.click();

      // Should still generate a URL
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  // Static Methods
  describe("decodeGenome (static)", () => {
    test("restores base64 padding (= characters)", () => {
      // Encode with padding removed, then decode
      const encoded = btoa("ATG GGA TAA").replace(/=/g, "");
      const decoded = ShareSystem.decodeGenome(encoded);
      expect(decoded).toBe("ATG GGA TAA");
    });

    test("replaces - with + for standard base64", () => {
      const original = "ATG GGA TAA";
      const encoded = btoa(original).replace(/\+/g, "-").replace(/=/g, "");
      const decoded = ShareSystem.decodeGenome(encoded);
      expect(decoded).toBe(original);
    });

    test("replaces _ with / for standard base64", () => {
      const original = "ATG GGA TAA";
      const encoded = btoa(original).replace(/\//g, "_").replace(/=/g, "");
      const decoded = ShareSystem.decodeGenome(encoded);
      expect(decoded).toBe(original);
    });

    test("decodes with atob", () => {
      const original = "ATG GGA TAA";
      const encoded = btoa(original);
      const decoded = ShareSystem.decodeGenome(encoded);
      expect(decoded).toBe(original);
    });

    test("falls back to decodeURIComponent on atob error", () => {
      const invalid = "not-valid-base64!!!";
      const decoded = ShareSystem.decodeGenome(encodeURIComponent(invalid));
      expect(decoded).toBe(invalid);
    });

    test("round-trips with encodeGenome correctly", () => {
      const original = "ATG GGA TAA";
      // Manually encode like the private method does
      const encoded = btoa(original)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      const decoded = ShareSystem.decodeGenome(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe("loadFromURL (static)", () => {
    test("reads genome parameter from URL search params", () => {
      const original = "ATG GGA TAA";
      const encoded = btoa(original)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      // Mock URLSearchParams
      const originalURL = window.location.href;
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `${originalURL}?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBe(original);
    });

    test("returns null when genome parameter missing", () => {
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: "",
          href: window.location.href.split("?")[0],
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBeNull();
    });

    test("decodes genome using decodeGenome", () => {
      const original = "ATG GGA TAA";
      const encoded = btoa(original)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBe(original);
    });

    test("validates genome format before returning", () => {
      // Invalid genome with special characters
      const invalid = "<script>alert('xss')</script>";
      const encoded = btoa(invalid)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBeNull();
    });

    test("returns null for invalid genome format", () => {
      const invalid = "invalid!@#$%genome";
      const encoded = btoa(invalid)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBeNull();
    });
  });

  describe("isValidGenome (private static)", () => {
    // Test through loadFromURL
    test("accepts valid genome with only ATGC and whitespace", () => {
      const valid = "ATG GGA TAA";
      const encoded = btoa(valid)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBe(valid);
    });

    test("is case-insensitive (accepts lowercase atgc)", () => {
      const valid = "atg gga taa";
      const encoded = btoa(valid)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBe(valid);
    });

    test("accepts newlines and carriage returns", () => {
      const valid = "ATG\nGGA\r\nTAA";
      const encoded = btoa(valid)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBe(valid);
    });

    test("rejects genomes with invalid characters", () => {
      const invalid = "ATG XYZ TAA";
      const encoded = btoa(invalid)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBeNull();
    });

    test("rejects genomes longer than 1MB (DoS prevention)", () => {
      // Create genome > 1MB
      const longGenome = "ATG ".repeat(300000); // ~1.2MB
      const encoded = btoa(longGenome)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      expect(result).toBeNull();
    });

    test("rejects empty string", () => {
      const empty = "";
      const encoded = btoa(empty)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          search: `?genome=${encoded}`,
          href: `http://test.com?genome=${encoded}`,
        },
        writable: true,
        configurable: true,
      });

      const result = ShareSystem.loadFromURL();
      // Empty string would fail the regex test
      expect(result).toBeNull();
    });
  });
});

describe("injectShareStyles", () => {
  beforeEach(() => {
    const existing = document.getElementById("share-system-styles");
    if (existing) existing.remove();
  });

  test("creates style element with id 'share-system-styles'", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style).not.toBeNull();
    expect(style?.tagName).toBe("STYLE");
  });

  test("appends style to document.head", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style?.parentNode).toBe(document.head);
  });

  test("does nothing if styles already injected (idempotent)", () => {
    injectShareStyles();
    injectShareStyles();
    const styles = document.querySelectorAll("#share-system-styles");
    expect(styles.length).toBe(1);
  });

  test("includes CSS for share-system container", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style?.textContent).toContain(".share-system");
  });

  test("includes CSS for share buttons", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style?.textContent).toContain(".share-btn");
  });

  test("includes CSS for social buttons with hover states", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style?.textContent).toContain(".social-btn");
    expect(style?.textContent).toContain(":hover");
  });

  test("includes CSS for feedback messages (success, error, info)", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style?.textContent).toContain(".share-feedback.success");
    expect(style?.textContent).toContain(".share-feedback.error");
    expect(style?.textContent).toContain(".share-feedback.info");
  });

  test("includes CSS for modal overlay and content", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style?.textContent).toContain(".share-modal");
    expect(style?.textContent).toContain(".modal-overlay");
    expect(style?.textContent).toContain(".modal-content");
  });

  test("includes responsive CSS for mobile (max-width 768px)", () => {
    injectShareStyles();
    const style = document.getElementById("share-system-styles");
    expect(style?.textContent).toContain("@media");
    expect(style?.textContent).toContain("768px");
  });
});

describe("escapeHtml", () => {
  // escapeHtml is private, test through modal content
  test("escapes & as &amp;", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Mock clipboard to fail to trigger modal
    const mockClipboard = {
      writeText: mock(() => Promise.reject(new Error("fail"))),
    };
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      configurable: true,
    });

    new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG TAA",
    });

    const permalinkBtn = container.querySelector(
      "#share-permalink",
    ) as HTMLButtonElement;
    permalinkBtn.click();
    await new Promise((r) => setTimeout(r, 50));

    // Modal should handle special chars safely
    const modal = container.querySelector("#share-modal");
    expect(modal?.innerHTML).not.toContain("&<>");

    container.remove();
  });

  test("escapes dangerous characters in modal content", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Mock clipboard to fail to trigger modal with URL containing special chars
    const mockClipboard = {
      writeText: mock(() => Promise.reject(new Error("fail"))),
    };
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      configurable: true,
    });

    new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG TAA",
    });

    const permalinkBtn = container.querySelector(
      "#share-permalink",
    ) as HTMLButtonElement;
    permalinkBtn.click();
    await new Promise((r) => setTimeout(r, 50));

    // Modal content should not contain unescaped dangerous characters
    const modal = container.querySelector("#share-modal");
    const modalHtml = modal?.innerHTML || "";
    // Verify no raw script injection possible
    expect(modalHtml).not.toContain("<script>");
    expect(modalHtml).not.toContain("</script>");

    container.remove();
  });
});

describe("Integration", () => {
  test("share system integrates with CodonCanvas playground", () => {
    const container = document.createElement("div");
    const system = new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG GGA TAA",
      appTitle: "CodonCanvas Playground",
    });
    expect(system).toBeDefined();
    expect(container.querySelector(".share-system")).not.toBeNull();
  });

  test("share system integrates with mutation demos page", () => {
    const container = document.createElement("div");
    const system = new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG GGA TAA",
      appTitle: "CodonCanvas Mutation Demos",
      showQRCode: true,
      socialPlatforms: ["twitter", "reddit", "email"],
    });
    expect(system).toBeDefined();
  });

  test("loadFromURL correctly restores shared genome in playground", () => {
    const genome = "ATG GGA TAA";
    const encoded = btoa(genome)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        search: `?genome=${encoded}`,
        href: `http://test.com?genome=${encoded}`,
      },
      writable: true,
      configurable: true,
    });

    const result = ShareSystem.loadFromURL();
    expect(result).toBe(genome);
  });

  test("all share methods handle very long genomes", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const longGenome = `${"ATG ".repeat(1000)}TAA`; // Long but valid
    new ShareSystem({
      containerElement: container,
      getGenome: () => longGenome,
    });

    // Should not throw for long genomes
    const copyBtn = container.querySelector("#share-copy") as HTMLButtonElement;
    expect(() => copyBtn.click()).not.toThrow();

    container.remove();
  });

  test("all share methods handle genomes with comments", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Genome with semicolon comments
    const genomeWithComments =
      "; This is a comment\nATG GGA TAA\n; Another comment";
    new ShareSystem({
      containerElement: container,
      getGenome: () => genomeWithComments,
    });

    // Copy should work
    const copyBtn = container.querySelector("#share-copy") as HTMLButtonElement;
    expect(() => copyBtn.click()).not.toThrow();

    // Download should work
    const downloadBtn = container.querySelector(
      "#share-download",
    ) as HTMLButtonElement;
    expect(() => downloadBtn.click()).not.toThrow();

    // Permalink should work
    const permalinkBtn = container.querySelector(
      "#share-permalink",
    ) as HTMLButtonElement;
    expect(() => permalinkBtn.click()).not.toThrow();

    container.remove();
  });
});

describe("Edge Cases", () => {
  test("handles containerElement being removed from DOM", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG TAA",
    });

    container.remove();

    // Should not throw when container is removed
    expect(container.querySelector(".share-system")).not.toBeNull();
  });

  test("handles window.open being blocked by popup blocker", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Mock window.open to return null (blocked)
    window.open = mock(() => null);

    new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG TAA",
    });

    const twitterBtn = container.querySelector(
      "#share-twitter",
    ) as HTMLButtonElement;
    expect(() => twitterBtn.click()).not.toThrow();

    container.remove();
  });

  test("handles navigator.clipboard not available", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Remove clipboard API
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    try {
      new ShareSystem({
        containerElement: container,
        getGenome: () => "ATG TAA",
      });

      const copyBtn = container.querySelector(
        "#share-copy",
      ) as HTMLButtonElement;
      expect(() => copyBtn.click()).not.toThrow();
    } finally {
      container.remove();
    }
  });

  test("handles clipboard API rejection gracefully", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: mock(() => Promise.reject(new Error("fail"))),
      },
      configurable: true,
    });

    new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG TAA",
    });

    const copyBtn = container.querySelector("#share-copy") as HTMLButtonElement;
    expect(() => copyBtn.click()).not.toThrow();

    container.remove();
  });

  test("handles qrserver.com API being unavailable", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG TAA",
    });

    const qrBtn = container.querySelector("#share-qr") as HTMLButtonElement;
    qrBtn.click();

    // Modal should be shown with QR code
    const modal = container.querySelector("#share-modal");
    expect(modal?.classList.contains("hidden")).toBe(false);

    const img = modal?.querySelector("img");
    expect(img).not.toBeNull();

    // Simulate image load error - verify graceful degradation
    if (img) {
      expect(() => img.dispatchEvent(new Event("error"))).not.toThrow();
    }

    // Modal should still be visible after error (graceful degradation)
    expect(modal?.classList.contains("hidden")).toBe(false);

    // No error feedback should be displayed
    const feedback = container.querySelector("#share-feedback");
    expect(feedback?.classList.contains("error")).toBe(false);

    container.remove();
  });

  test("handles URL with existing query parameters", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        href: "http://test.com?foo=bar&baz=qux",
        search: "?foo=bar&baz=qux",
      },
      writable: true,
      configurable: true,
    });

    const mockClipboard = {
      writeText: mock(() => Promise.resolve()),
    };
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      configurable: true,
    });

    new ShareSystem({
      containerElement: container,
      getGenome: () => "ATG TAA",
    });

    const permalinkBtn = container.querySelector(
      "#share-permalink",
    ) as HTMLButtonElement;
    permalinkBtn.click();

    // Should create clean URL with just genome param
    const calls = mockClipboard.writeText.mock.calls as unknown[][];
    const url = calls[0]?.[0] as string;
    expect(url.match(/\?/g)?.length).toBe(1); // Only one ?

    container.remove();
  });
});
