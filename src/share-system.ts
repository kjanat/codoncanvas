/**
 * share-system.ts
 * Universal sharing and export system for CodonCanvas genomes
 * Enables viral sharing, teacher workflows, and cross-device collaboration
 */

/**
 * SECURITY: Escape HTML to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
      <div class="share-system">
        <div class="share-header">
          <span class="share-title">Share & Export</span>
        </div>
        <div class="share-actions">
          <button class="share-btn" id="share-copy" title="Copy genome to clipboard">
            📋 Copy
          </button>
          <button class="share-btn" id="share-permalink" title="Generate shareable link">
            🔗 Link
          </button>
          <button class="share-btn" id="share-download" title="Download as .genome file">
            💾 Download
          </button>
          ${
      this.showQRCode
        ? "<button class=\"share-btn\" id=\"share-qr\" title=\"Generate QR code\">📱 QR Code</button>"
        : ""
    }
        </div>
        <div class="share-social">
          ${
      this.socialPlatforms.includes("twitter")
        ? "<button class=\"social-btn twitter\" id=\"share-twitter\" title=\"Share on Twitter\">🐦 Twitter</button>"
        : ""
    }
          ${
      this.socialPlatforms.includes("reddit")
        ? "<button class=\"social-btn reddit\" id=\"share-reddit\" title=\"Share on Reddit\">🔴 Reddit</button>"
        : ""
    }
          ${
      this.socialPlatforms.includes("email")
        ? "<button class=\"social-btn email\" id=\"share-email\" title=\"Share via email\">📧 Email</button>"
        : ""
    }
        </div>
        <div id="share-feedback" class="share-feedback"></div>
        <div id="share-modal" class="share-modal hidden"></div>
      </div>
    `;

    // Build share UI safely
    const tempDiv = document.createElement('div');
    tempDiv.insertAdjacentHTML('afterbegin', html);
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
      this.showFeedback("✅ Copied to clipboard!", "success");
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = genome;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        this.showFeedback("✅ Copied to clipboard!", "success");
      } catch (err) {
        this.showFeedback("❌ Failed to copy", "error");
      }

      document.body.removeChild(textarea);
    }
  }

  /**
   * Generate permalink with genome encoded in URL
   */
  private generatePermalink(): void {
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback("No genome to share", "error");
      return;
    }

    const encoded = this.encodeGenome(genome);
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const permalink = `${currentUrl}?genome=${encoded}`;

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
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback("No genome to encode", "error");
      return;
    }

    const encoded = this.encodeGenome(genome);
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const permalink = `${currentUrl}?genome=${encoded}`;

    // Use QR code API
    const qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${
        encodeURIComponent(
          permalink,
        )
      }`;

    this.showModal(
      "QR Code",
      `
      <div style="text-align: center;">
        <img src="${escapeHtml(qrUrl)}" alt="QR Code" style="max-width: 100%;">
        <p style="margin-top: 1rem; font-size: 0.875rem; color: #888;">
          Scan with mobile device to open genome
        </p>
      </div>
    `,
    );
  }

  /**
   * Share to Twitter
   */
  private shareToTwitter(): void {
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback("No genome to share", "error");
      return;
    }

    const encoded = this.encodeGenome(genome);
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const permalink = `${currentUrl}?genome=${encoded}`;

    const text =
      `Check out my DNA-inspired visual program in ${this.appTitle}! 🧬`;
    const hashtags = "CodonCanvas,BioInformatics,VisualProgramming";

    const twitterUrl = `https://twitter.com/intent/tweet?text=${
      encodeURIComponent(
        text,
      )
    }&url=${encodeURIComponent(permalink)}&hashtags=${hashtags}`;

    window.open(twitterUrl, "_blank", "width=550,height=420");
  }

  /**
   * Share to Reddit
   */
  private shareToReddit(): void {
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback("No genome to share", "error");
      return;
    }

    const encoded = this.encodeGenome(genome);
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const permalink = `${currentUrl}?genome=${encoded}`;

    const title = `My DNA-inspired visual program in ${this.appTitle}`;

    const redditUrl = `https://reddit.com/submit?url=${
      encodeURIComponent(
        permalink,
      )
    }&title=${encodeURIComponent(title)}`;

    window.open(redditUrl, "_blank");
  }

  /**
   * Share via email
   */
  private shareViaEmail(): void {
    const genome = this.getGenome();

    if (!genome || genome.trim().length === 0) {
      this.showFeedback("No genome to share", "error");
      return;
    }

    const encoded = this.encodeGenome(genome);
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const permalink = `${currentUrl}?genome=${encoded}`;

    const subject = `Check out my ${this.appTitle} program`;
    const body =
      `I created a DNA-inspired visual program using ${this.appTitle}!\n\nView it here: ${permalink}\n\nGenome:\n${genome}`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${
      encodeURIComponent(
        body,
      )
    }`;

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

    feedback.className = `share-feedback ${type}`;
    feedback.textContent = message;

    setTimeout(() => {
      feedback.className = "share-feedback";
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
    overlay.className = "modal-overlay";
    overlay.addEventListener("click", () => modal.classList.add("hidden"));

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.addEventListener("click", (e) => e.stopPropagation());

    const header = document.createElement("div");
    header.className = "modal-header";

    const h3 = document.createElement("h3");
    h3.textContent = title; // SAFE: textContent escapes

    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

    header.appendChild(h3);
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "modal-body";
    // Build modal body safely - content is pre-escaped HTML from callers
    const tempDiv = document.createElement('div');
    tempDiv.insertAdjacentHTML('afterbegin', content);
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
    } catch (error) {
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
    } catch (error) {
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
    if (genome.length > 1000000) { // 1MB limit
      return false;
    }

    return validPattern.test(genome);
  }
}

/**
 * Inject share system styles
 */
export function injectShareStyles(): void {
  if (document.getElementById("share-system-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "share-system-styles";
  style.textContent = `
    .share-system {
      background: #2d2d30;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      padding: 1rem;
    }

    .share-header {
      font-weight: bold;
      font-size: 0.875rem;
      color: #4ec9b0;
      margin-bottom: 0.75rem;
    }

    .share-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .share-btn {
      flex: 1;
      min-width: 90px;
      background: #0e639c;
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .share-btn:hover {
      background: #1177bb;
    }

    .share-btn:active {
      transform: translateY(1px);
    }

    .share-social {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .social-btn {
      flex: 1;
      min-width: 90px;
      background: #3e3e42;
      color: #d4d4d4;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .social-btn.twitter:hover {
      background: #1da1f2;
      color: white;
    }

    .social-btn.reddit:hover {
      background: #ff4500;
      color: white;
    }

    .social-btn.email:hover {
      background: #888;
      color: white;
    }

    .share-feedback {
      margin-top: 0.75rem;
      padding: 0.5rem;
      border-radius: 3px;
      font-size: 0.875rem;
      text-align: center;
      min-height: 1.5rem;
    }

    .share-feedback.success {
      background: rgba(78, 201, 176, 0.2);
      color: #4ec9b0;
      border: 1px solid #4ec9b0;
    }

    .share-feedback.error {
      background: rgba(241, 95, 95, 0.2);
      color: #f15f5f;
      border: 1px solid #f15f5f;
    }

    .share-feedback.info {
      background: rgba(14, 99, 156, 0.2);
      color: #569cd6;
      border: 1px solid #569cd6;
    }

    .share-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }

    .share-modal.hidden {
      display: none;
    }

    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-content {
      background: #2d2d30;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #3e3e42;
    }

    .modal-header h3 {
      margin: 0;
      color: #4ec9b0;
      font-size: 1.125rem;
    }

    .modal-close {
      background: none;
      border: none;
      color: #d4d4d4;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      color: #f15f5f;
    }

    .modal-body {
      padding: 1rem;
    }

    @media (max-width: 768px) {
      .share-actions,
      .share-social {
        flex-direction: column;
      }

      .share-btn,
      .social-btn {
        min-width: auto;
      }
    }
  `;

  document.head.appendChild(style);
}
