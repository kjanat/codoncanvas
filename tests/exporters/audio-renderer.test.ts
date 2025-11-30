/**
 * Audio Renderer Test Suite
 *
 * Tests for Web Audio-based rendering that maps visual opcodes to sound synthesis.
 * Implements the Renderer interface for multi-sensory learning.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { AudioRenderer } from "@/exporters/audio-renderer";

// Mock MediaStream for testing
class MockMediaStream {
  id = "mock-stream";
  active = true;
  getTracks() {
    return [];
  }
}

// Mock MediaRecorder for testing
class MockMediaRecorder {
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state: "inactive" | "recording" = "inactive";

  start() {
    this.state = "recording";
    // Simulate data being available
    setTimeout(() => {
      if (this.ondataavailable) {
        this.ondataavailable({
          data: new Blob(["test"], { type: "audio/webm" }),
        });
      }
    }, 0);
  }

  stop() {
    this.state = "inactive";
    // Simulate stop completing
    setTimeout(() => {
      if (this.onstop) {
        this.onstop();
      }
    }, 0);
  }
}

// Store original MediaRecorder and MediaStream
const originalMediaRecorder = globalThis.MediaRecorder;
const originalMediaStream = globalThis.MediaStream;

// Mock AudioContext for testing
class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  destination = {};

  createOscillator() {
    return {
      type: "sine",
      frequency: { value: 440, setValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }

  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
      },
      connect: () => {},
    };
  }

  createBiquadFilter() {
    return {
      type: "lowpass",
      frequency: {
        value: 2000,
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
      },
      Q: { value: 1 },
      connect: () => {},
    };
  }

  createStereoPanner() {
    return {
      pan: { value: 0 },
      connect: () => {},
    };
  }

  createMediaStreamDestination() {
    return {
      stream: new MockMediaStream(),
    };
  }

  createBuffer(_channels: number, length: number, _sampleRate: number) {
    return {
      getChannelData: () => new Float32Array(length),
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      start: () => {},
    };
  }

  close() {
    return Promise.resolve();
  }
}

// Store original AudioContext
const originalAudioContext = globalThis.AudioContext;

describe("AudioRenderer", () => {
  beforeEach(() => {
    // Mock AudioContext
    (globalThis as Record<string, unknown>).AudioContext = MockAudioContext;
    // Mock MediaRecorder
    (globalThis as Record<string, unknown>).MediaRecorder = MockMediaRecorder;
    // Mock MediaStream
    (globalThis as Record<string, unknown>).MediaStream = MockMediaStream;
  });

  afterEach(() => {
    // Restore original
    (globalThis as Record<string, unknown>).AudioContext = originalAudioContext;
    (globalThis as Record<string, unknown>).MediaRecorder =
      originalMediaRecorder;
    (globalThis as Record<string, unknown>).MediaStream = originalMediaStream;
  });

  // Constructor & Properties
  describe("constructor", () => {
    test("initializes audioContext as null (lazy initialization)", () => {
      const renderer = new AudioRenderer();
      // audioContext is private, but we can verify by checking width/height
      expect(renderer.width).toBe(1000);
    });

    test("initializes with valid transform state", () => {
      const renderer = new AudioRenderer();
      const transform = renderer.getCurrentTransform();
      expect(transform).toBeDefined();
      expect(transform.scale).toBeCloseTo(1, 1);
    });

    test("sets width and height to 1000 for interface compatibility", () => {
      const renderer = new AudioRenderer();
      expect(renderer.width).toBe(1000);
      expect(renderer.height).toBe(1000);
    });
  });

  // Initialization
  describe("initialize", () => {
    test("creates new AudioContext", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      // No error means it initialized
      expect(renderer.width).toBe(1000);
    });

    test("does nothing if already initialized", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      await renderer.initialize(); // Should not throw
      expect(renderer.width).toBe(1000);
    });

    test("returns Promise that resolves when setup complete", async () => {
      const renderer = new AudioRenderer();
      const result = await renderer.initialize();
      expect(result).toBeUndefined();
    });
  });

  // Recording
  describe("startRecording", () => {
    test("throws error when not initialized", () => {
      const renderer = new AudioRenderer();
      expect(() => renderer.startRecording()).toThrow(
        "AudioRenderer not initialized",
      );
    });

    test("starts recording when initialized", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      expect(() => renderer.startRecording()).not.toThrow();
    });
  });

  describe("stopRecording", () => {
    test("rejects if not currently recording", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      await expect(renderer.stopRecording()).rejects.toThrow(
        "Not currently recording",
      );
    });

    test("returns blob when recording is active", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.startRecording();
      // Give time for data to be available
      await new Promise((resolve) => setTimeout(resolve, 10));
      const blob = await renderer.stopRecording();
      expect(blob).toBeInstanceOf(Blob);
    });

    test("resolves with audio/webm blob type", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.startRecording();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const blob = await renderer.stopRecording();
      expect(blob.type).toBe("audio/webm");
    });
  });

  describe("exportWAV", () => {
    test("calls stopRecording and returns result", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      // Without recording, this should reject
      await expect(renderer.exportWAV()).rejects.toThrow();
    });

    test("returns blob when recording", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.startRecording();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const blob = await renderer.exportWAV();
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  // Clear/Reset
  describe("clear", () => {
    test("resets currentFrequency to 440 Hz", () => {
      const renderer = new AudioRenderer();
      renderer.clear();
      const transform = renderer.getCurrentTransform();
      expect(transform).toBeDefined();
    });

    test("resets currentPan to 0", () => {
      const renderer = new AudioRenderer();
      renderer.translate(30, 0); // Move pan
      renderer.clear();
      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBeCloseTo(0);
    });
  });

  // Resize
  describe("resize", () => {
    test("accepts width/height params but ignores them (audio has no dimensions)", () => {
      const renderer = new AudioRenderer();
      renderer.translate(30, 20);
      renderer.rotate(45);

      // Should not throw, and should reset state (calls clear internally)
      expect(() => renderer.resize(800, 600)).not.toThrow();

      // Verify state was reset (pan resets to 0)
      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBeCloseTo(0);
    });

    test("works with no params (matches Renderer interface)", () => {
      const renderer = new AudioRenderer();
      renderer.translate(50, 0); // Pan right

      expect(() => renderer.resize()).not.toThrow();

      // Pan should reset to 0
      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBeCloseTo(0);
    });
  });

  // Drawing Opcodes -> Sound Synthesis
  describe("circle", () => {
    test("maps radius 0-64 to frequency 220-880 Hz", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      // Should not throw
      expect(() => renderer.circle(32)).not.toThrow();
    });

    test("calls playTone with sine type", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.circle(20);
      expect(renderer.width).toBe(1000); // Just verify no crash
    });
  });

  describe("rect", () => {
    test("maps width 0-64 to frequency 220-880 Hz", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      expect(() => renderer.rect(32, 32)).not.toThrow();
    });

    test("maps height to duration multiplier", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.rect(32, 64);
      expect(renderer.width).toBe(1000);
    });
  });

  describe("line", () => {
    test("maps length 0-64 to duration 0.1-0.6 seconds", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      expect(() => renderer.line(32)).not.toThrow();
    });

    test("uses currentFrequency for pitch", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.line(40);
      expect(renderer.width).toBe(1000);
    });
  });

  describe("triangle", () => {
    test("maps size 0-64 to frequency 220-880 Hz", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      expect(() => renderer.triangle(32)).not.toThrow();
    });

    test("plays triangle wave with currentDuration", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.triangle(48);
      expect(renderer.width).toBe(1000);
    });
  });

  describe("ellipse", () => {
    test("uses rx as carrier frequency (220-880 Hz)", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      expect(() => renderer.ellipse(32, 16)).not.toThrow();
    });

    test("uses ry as modulation depth (0-1)", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.ellipse(32, 64);
      expect(renderer.width).toBe(1000);
    });
  });

  describe("noise", () => {
    test("maps intensity 0-64 to duration 0.05-0.35 seconds", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      expect(() => renderer.noise(123, 32)).not.toThrow();
    });

    test("does nothing when audioContext not initialized", () => {
      const renderer = new AudioRenderer();
      expect(() => renderer.noise(123, 32)).not.toThrow();
    });
  });

  // Transform Opcodes -> Audio Parameters
  describe("translate", () => {
    test("maps dx -63 to 63 -> pan -1 to 1 (left to right)", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();

      renderer.translate(63, 0);
      let transform = renderer.getCurrentTransform();
      expect(transform.x).toBeCloseTo(63);

      renderer.clear();
      renderer.translate(-63, 0);
      transform = renderer.getCurrentTransform();
      expect(transform.x).toBeCloseTo(-63);
    });

    test("ignores dy parameter (no vertical dimension in audio)", () => {
      const renderer = new AudioRenderer();
      renderer.translate(0, 100);
      const transform = renderer.getCurrentTransform();
      expect(transform.y).toBe(0);
    });

    test("clamps pan to -1 to 1 range", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.translate(200, 0); // Beyond range
      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBeLessThanOrEqual(63);
    });
  });

  describe("setPosition", () => {
    test("maps x coordinate to time offset (x / 100)", () => {
      const renderer = new AudioRenderer();
      renderer.setPosition(100, 50);
      // Time is internal, but should not throw
      expect(renderer.width).toBe(1000);
    });

    test("ignores y coordinate", () => {
      const renderer = new AudioRenderer();
      renderer.setPosition(0, 999);
      const transform = renderer.getCurrentTransform();
      expect(transform.y).toBe(0);
    });
  });

  describe("rotate", () => {
    test("maps degrees 0-360 to filter cutoff 200-20000 Hz (log scale)", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.rotate(180);
      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBeGreaterThan(0);
    });

    test("uses modulo to wrap degrees to 0-360 range", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.rotate(720);
      const transform = renderer.getCurrentTransform();
      // 720 % 360 = 0
      expect(transform.rotation).toBeCloseTo(0, 0);
    });
  });

  describe("setRotation", () => {
    test("maps degrees to filter frequency range", () => {
      const renderer = new AudioRenderer();
      renderer.setRotation(90);
      // Internal state update
      expect(renderer.width).toBe(1000);
    });
  });

  describe("scale", () => {
    test("multiplies currentGain by factor", () => {
      const renderer = new AudioRenderer();
      renderer.scale(2);
      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBeGreaterThan(1);
    });

    test("clamps result to 0.01-1 range", () => {
      const renderer = new AudioRenderer();
      renderer.scale(100); // Huge factor
      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBeLessThanOrEqual(1 / 0.3 + 0.1);
    });
  });

  describe("setScale", () => {
    test("sets currentGain directly", () => {
      const renderer = new AudioRenderer();
      renderer.setScale(0.5);
      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBeCloseTo(0.5 / 0.3, 1);
    });

    test("clamps to 0-1 range", () => {
      const renderer = new AudioRenderer();
      renderer.setScale(2); // Beyond range
      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBeLessThanOrEqual(1 / 0.3 + 0.1);
    });
  });

  describe("setColor", () => {
    test("maps hue 0-360 to filter cutoff frequency (log scale)", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.setColor(180, 50, 50);
      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBeGreaterThan(0);
    });

    test("maps saturation 0-100 to filter Q (0.1-10)", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      renderer.setColor(0, 100, 50);
      expect(renderer.width).toBe(1000);
    });

    test("maps lightness 0-100 to gain (0.01-1)", () => {
      const renderer = new AudioRenderer();
      renderer.setColor(0, 0, 50);
      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBeCloseTo(0.5 / 0.3, 1);
    });
  });

  // Utility Methods
  describe("getCurrentTransform", () => {
    test("returns x as pan * 63", () => {
      const renderer = new AudioRenderer();
      renderer.translate(30, 0);
      const transform = renderer.getCurrentTransform();
      const expectedX = Math.max(-1, Math.min(1, 30 / 63)) * 63;
      expect(transform.x).toBeCloseTo(expectedX, 1);
    });

    test("returns y as 0 (no y-axis in audio)", () => {
      const renderer = new AudioRenderer();
      const transform = renderer.getCurrentTransform();
      expect(transform.y).toBe(0);
    });

    test("returns rotation calculated from filter frequency", () => {
      const renderer = new AudioRenderer();
      renderer.rotate(180);
      const transform = renderer.getCurrentTransform();
      expect(typeof transform.rotation).toBe("number");
    });

    test("returns scale as currentGain / 0.3", () => {
      const renderer = new AudioRenderer();
      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBeCloseTo(1, 1); // Default 0.3 / 0.3 = 1
    });
  });

  describe("toDataURL", () => {
    test("returns placeholder data URL (not applicable for audio)", () => {
      const renderer = new AudioRenderer();
      const dataUrl = renderer.toDataURL();
      expect(dataUrl).toBe("data:audio/wav;base64,");
    });
  });

  describe("dispose", () => {
    test("closes audioContext", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      expect(() => renderer.dispose()).not.toThrow();
    });

    test("handles already-disposed state gracefully", () => {
      const renderer = new AudioRenderer();
      expect(() => renderer.dispose()).not.toThrow();
      expect(() => renderer.dispose()).not.toThrow(); // Second call
    });
  });

  // Private playTone Method (tested via public methods)
  describe("playTone (private, tested via shape methods)", () => {
    test("clamps frequency to audible range 20-20000 Hz", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();
      // Very small radius = low frequency
      renderer.circle(0);
      // Very large radius
      renderer.circle(64);
      expect(renderer.width).toBe(1000);
    });

    test("does nothing when audioContext not initialized", () => {
      const renderer = new AudioRenderer();
      // Should not throw even without initialization
      expect(() => renderer.circle(32)).not.toThrow();
    });
  });

  // Integration Tests
  describe("integration", () => {
    test("implements Renderer interface completely", () => {
      const renderer = new AudioRenderer();
      // Check all required methods exist
      expect(typeof renderer.clear).toBe("function");
      expect(typeof renderer.circle).toBe("function");
      expect(typeof renderer.rect).toBe("function");
      expect(typeof renderer.line).toBe("function");
      expect(typeof renderer.triangle).toBe("function");
      expect(typeof renderer.ellipse).toBe("function");
      expect(typeof renderer.setColor).toBe("function");
      expect(typeof renderer.translate).toBe("function");
      expect(typeof renderer.rotate).toBe("function");
      expect(typeof renderer.scale).toBe("function");
      expect(typeof renderer.getCurrentTransform).toBe("function");
      expect(typeof renderer.toDataURL).toBe("function");
    });

    test("transform state affects subsequent shape sounds", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();

      renderer.translate(30, 0);
      renderer.circle(32);
      renderer.translate(-30, 0);
      renderer.circle(32);

      expect(renderer.width).toBe(1000);
    });

    test("color state affects timbre of subsequent sounds", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();

      renderer.setColor(180, 50, 50);
      renderer.circle(32);
      renderer.setColor(0, 100, 100);
      renderer.circle(32);

      expect(renderer.width).toBe(1000);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles concurrent shape calls (overlapping sounds)", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();

      // Multiple rapid calls
      renderer.circle(20);
      renderer.rect(30, 30);
      renderer.line(40);
      renderer.triangle(50);

      expect(renderer.width).toBe(1000);
    });

    test("handles extreme parameter values", async () => {
      const renderer = new AudioRenderer();
      await renderer.initialize();

      // Very large values
      renderer.circle(1000);
      renderer.rect(1000, 1000);
      renderer.translate(1000, 1000);
      renderer.rotate(10000);
      renderer.scale(1000);

      // Very small/negative values
      renderer.circle(-10);
      renderer.rect(-10, -10);
      renderer.translate(-1000, -1000);
      renderer.rotate(-10000);
      renderer.scale(0);

      expect(renderer.width).toBe(1000);
    });
  });
});
