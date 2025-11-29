/**
 * share-system.ts
 * Universal sharing and export system for CodonCanvas genomes
 * Enables viral sharing, teacher workflows, and cross-device collaboration
 */

import { escapeHtml } from "@/utils/dom";

export interface ShareOptions {
  genome: string;
  title?: string;
  description?: string;
  hashtags?: string[];
}

export interface ShareSystemConfig {
  containerElement: HTMLElement;
  getGenome: () => string;
  appTitle?: string;
  showQRCode?: boolean;
  socialPlatforms?: ("twitter" | "reddit" | "email")[];
}

/**
 * ShareSystem class - Reusable sharing functionality
 */
export class ShareSystem {
  private container: HTMLElement;
  private getGenome: () => string;
  private appTitle: string;
  private showQRCode: boolean;
  private socialPlatforms: ("twitter" | "reddit" | "email")[];

  constructor(config: ShareSystemConfig) {
    this.container = config.containerElement;
    this.getGenome = config.getGenome;
    this.appTitle = config.appTitle ?? "CodonCanvas";
    this.showQRCode = config.showQRCode ?? true;
    this.socialPlatforms = config.socialPlatforms ?? [
      "twitter",
      "reddit",
      "email",
    ];

    this.render();
  }

  /**
   * Render share UI
   */
  private render(): void {
    const html = `
      <div class="bg-surface border border-border rounded-lg p-4">
        <div class="font-bold text-sm text-primary mb-3">
          <span class="share-title">Share & Export</span>
        </div>
        <div class="flex gap-2 flex-wrap mb-3">
          <button class="flex-1 min-w-[90px] bg-primary text-white border-none py-2 px-3 rounded cursor-pointer text-sm hover:bg-primary-hover active:translate-y-px transition-colors" id="share-copy" title="Copy genome to clipboard">
            📋 Copy
          </button>
          <button class="flex-1 min-w-[90px] bg-primary text-white border-none py-2 px-3 rounded cursor-pointer text-sm hover:bg-primary-hover active:translate-y-px transition-colors" id="share-permalink" title="Generate shareable link">
            🔗 Link
          </button>
          <button class="flex-1 min-w-[90px] bg-primary text-white border-none py-2 px-3 rounded cursor-pointer text-sm hover:bg-primary-hover active:translate-y-px transition-colors" id="share-download" title="Download as .genome file">
            💾 Download
          </button>
          ${
            this.showQRCode
              ? '<button class="flex-1 min-w-[90px] bg-primary text-white border-none py-2 px-3 rounded cursor-pointer text-sm hover:bg-primary-hover active:translate-y-px transition-colors" id="share-qr" title="Generate QR code">📱 QR Code</button>'
              : ""
          }
        </div>
        <div class="flex gap-2 flex-wrap">
          ${
            this.socialPlatforms.includes("twitter")
              ? '<button class="flex-1 min-w-[90px] bg-surface-alt text-text-muted border-none py-2 px-3 rounded cursor-pointer text-sm hover:bg-[#1da1f2] hover:text-white transition-colors" id="share-twitter" title="Share on Twitter">🐦 Twitter</button>'
              : ""
          }
          ${
            this.socialPlatforms.includes("reddit")
              ? '<button class="flex-1 min-w-[90px] bg-surface-alt text-text-muted border-none py-2 px-3 rounded cursor-pointer text-sm hover:bg-[#ff4500] hover:text-white transition-colors" id="share-reddit" title="Share on Reddit">🔴 Reddit</button>'
              : ""
          }
          ${
            this.socialPlatforms.includes("email")
              ? '<button class="flex-1 min-w-[90px] bg-surface-alt text-text-muted border-none py-2 px-3 rounded cursor-pointer text-sm hover:bg-gray-500 hover:text-white transition-colors" id="share-email" title="Share via email">📧 Email</button>'
              : ""
          }
        </div>
        <div id="share-feedback" class="mt-3 p-2 rounded text-sm text-center min-h-6"></div>
        <div id="share-modal" class="hidden fixed inset-0 z-50"></div>
      </div>
    `;

    // Build share UI safely
    const tempDiv = document.createElement("div");
    tempDiv.insertAdjacentHTML("afterbegin", html);
    this.container.replaceChildren(...tempDiv.children);
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const copyBtn = this.container.querySelector("#share-copy");
    const permalinkBtn = this.container.querySelector("#share-permalink");
    const downloadBtn = this.container.querySelector("#share-download");
    const qrBtn = this.container.querySelector("#share-qr");
    const twitterBtn = this.container.querySelector("#share-twitter");
    const redditBtn = this.container.querySelector("#share-reddit");
    const emailBtn = this.container.querySelector("#share-email");

    copyBtn?.addEventListener("click", () => this.copyToClipboard());
    permalinkBtn?.addEventListener("click", () => this.generatePermalink());
    downloadBtn?.addEventListener("click", () => this.downloadGenome());
    qrBtn?.addEventListener("click", () => this.generateQRCode());
    twitterBtn?.addEventListener("click", () => this.shareToTwitter());
    redditBtn?.addEventListener("click", () => this.shareToReddit());
    emailBtn?.addEventListener("click", () => this.shareViaEmail());
  }

  /**
   * Copy genome to clipboard
   */
  private async copyToClipboard(): Promise<void> {
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback("No genome to copy", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(genome);
      this.showFeedback("Copied to clipboard!", "success");
    } catch {
      this.showFeedback("Failed to copy", "error");
    }
  }

  /**
   * Get permalink for current genome, or show error and return null
   */
  private getPermalinkOrFail(errorMessage: string): {
    genome: string;
    permalink: string;
  } | null {
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback(errorMessage, "error");
      return null;
    }

    const encoded = this.encodeGenome(genome);
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const permalink = `${currentUrl}?genome=${encoded}`;

    return { genome, permalink };
  }

  /**
   * Generate permalink with genome encoded in URL
   */
  private generatePermalink(): void {
    const result = this.getPermalinkOrFail("No genome to share");
    if (!result) return;

    const { permalink } = result;

    // Copy permalink to clipboard
    navigator.clipboard
      .writeText(permalink)
      .then(() => {
        this.showFeedback("🔗 Permalink copied!", "success");
      })
      .catch(() => {
        // Show in modal if clipboard fails
        this.showModal(
          "Permalink",
          `<input type="text" value="${escapeHtml(permalink)}" readonly style="width: 100%; padding: 8px; font-family: monospace;">`,
        );
      });
  }

  /**
   * Download genome as .genome file
   */
  private downloadGenome(): void {
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback("No genome to download", "error");
      return;
    }

    const blob = new Blob([genome], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codoncanvas-${Date.now()}.genome`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showFeedback("💾 Downloaded!", "success");
  }

  /**
   * Generate QR code for genome permalink
   */
  private generateQRCode(): void {
    const result = this.getPermalinkOrFail("No genome to encode");
    if (!result) return;

    const { permalink } = result;

    // Use extracted QR code component
    import("@/components/ShareQRCode").then(({ renderQRCodeToContainer }) => {
      this.showModal("QR Code", `<div id="qr-code-container"></div>`);

      const container = document.getElementById("qr-code-container");
      if (container) {
        renderQRCodeToContainer(container, permalink);
      }
    });
  }

  /**
   * Share to Twitter
   */
  private shareToTwitter(): void {
    const result = this.getPermalinkOrFail("No genome to share");
    if (!result) return;

    const { permalink } = result;

    const text = `Check out my DNA-inspired visual program in ${this.appTitle}! 🧬`;
    const hashtags = "CodonCanvas,BioInformatics,VisualProgramming";

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(permalink)}&hashtags=${hashtags}`;

    window.open(twitterUrl, "_blank", "width=550,height=420");
  }

  /**
   * Share to Reddit
   */
  private shareToReddit(): void {
    const result = this.getPermalinkOrFail("No genome to share");
    if (!result) return;

    const { permalink } = result;

    const title = `My DNA-inspired visual program in ${this.appTitle}`;

    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(
      permalink,
    )}&title=${encodeURIComponent(title)}`;

    window.open(redditUrl, "_blank");
  }

  /**
   * Share via email
   */
  private shareViaEmail(): void {
    const result = this.getPermalinkOrFail("No genome to share");
    if (!result) return;

    const { genome, permalink } = result;

    const subject = `Check out my ${this.appTitle} program`;
    const body = `I created a DNA-inspired visual program using ${this.appTitle}!\n\nView it here: ${permalink}\n\nGenome:\n${genome}`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body,
    )}`;

    window.location.href = mailtoUrl;
  }

  /**
   * Show feedback message
   */
  private showFeedback(
    message: string,
    type: "success" | "error" | "info" = "info",
  ): void {
    const feedback = this.container.querySelector("#share-feedback");
    if (!feedback) {
      return;
    }

    let colorClasses = "bg-blue-500/20 text-blue-500 border border-blue-500";
    if (type === "success") {
      colorClasses = "bg-green-500/20 text-green-500 border border-green-500";
    } else if (type === "error") {
      colorClasses = "bg-red-500/20 text-red-500 border border-red-500";
    }

    feedback.className = `mt-3 p-2 rounded text-sm text-center min-h-6 ${colorClasses}`;
    feedback.textContent = message;

    setTimeout(() => {
      feedback.className = "mt-3 p-2 rounded text-sm text-center min-h-6";
      feedback.textContent = "";
    }, 3000);
  }

  /**
   * Show modal with content
   */
  private showModal(title: string, content: string): void {
    const modal = this.container.querySelector("#share-modal");
    if (!modal) {
      return;
    }

    // SAFE: Build DOM programmatically to prevent XSS
    modal.textContent = ""; // Clear safely

    const overlay = document.createElement("div");
    overlay.className =
      "absolute inset-0 bg-black/70 flex items-center justify-center p-4";
    overlay.addEventListener("click", () => modal.classList.add("hidden"));

    const modalContent = document.createElement("div");
    modalContent.className =
      "bg-surface border border-border rounded-lg max-w-[500px] w-full max-h-[80vh] overflow-auto shadow-xl";
    modalContent.addEventListener("click", (e) => e.stopPropagation());

    const header = document.createElement("div");
    header.className =
      "flex justify-between items-center p-4 border-b border-border";

    const h3 = document.createElement("h3");
    h3.className = "m-0 text-primary text-lg font-bold";
    h3.textContent = title; // SAFE: textContent escapes

    const closeBtn = document.createElement("button");
    closeBtn.className =
      "text-text-muted hover:text-red-500 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center bg-transparent border-none transition-colors";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

    header.appendChild(h3);
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "p-4";
    // Build modal body safely - content is pre-escaped HTML from callers
    const tempDiv = document.createElement("div");
    tempDiv.insertAdjacentHTML("afterbegin", content);
    body.replaceChildren(...tempDiv.children);

    modalContent.appendChild(header);
    modalContent.appendChild(body);
    overlay.appendChild(modalContent);
    modal.appendChild(overlay);

    modal.classList.remove("hidden");
  }

  /**
   * Encode genome for URL
   */
  private encodeGenome(genome: string): string {
    try {
      return btoa(genome)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    } catch (_error) {
      return encodeURIComponent(genome);
    }
  }

  /**
   * Decode genome from URL
   */
  static decodeGenome(encoded: string): string {
    try {
      // Restore base64 padding
      const padding = "=".repeat((4 - (encoded.length % 4)) % 4);
      const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/") + padding;

      return atob(base64);
    } catch (_error) {
      return decodeURIComponent(encoded);
    }
  }

  /**
   * Load genome from URL parameter if present
   * SECURITY: Validates decoded genome before returning
   */
  static loadFromURL(): string | null {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("genome");

    if (!encoded) {
      return null;
    }

    const decoded = ShareSystem.decodeGenome(encoded);

    // SECURITY: Validate genome format before use
    if (!ShareSystem.isValidGenome(decoded)) {
      return null;
    }

    return decoded;
  }

  /**
   * SECURITY: Validate genome contains only safe characters
   * Genomes should be codon triplets (A/T/G/C) with whitespace
   */
  private static isValidGenome(genome: string): boolean {
    // Allow codons (ATG, etc), whitespace, and common separators
    const validPattern = /^[ATGC\s\n\r]+$/i;

    // Check length limits (prevent DoS)
    if (genome.length > 1000000) {
      // 1MB limit
      return false;
    }

    return validPattern.test(genome);
  }
}
