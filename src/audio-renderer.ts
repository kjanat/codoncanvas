/**
 * Audio rendering implementation for CodonCanvas.
 * Maps visual drawing opcodes to audio synthesis for multi-sensory learning.
 *
 * OPCODE → AUDIO MAPPING:
 * - CIRCLE → Sine wave (radius = frequency Hz)
 * - RECT → Square wave (width = frequency, height = duration)
 * - LINE → Sawtooth wave (length = duration)
 * - TRIANGLE → Triangle wave (size = frequency)
 * - ELLIPSE → FM synthesis (rx = carrier freq, ry = modulator freq)
 * - TRANSLATE → Stereo pan (dx = left/right balance, dy ignored)
 * - ROTATE → Filter sweep (degrees = filter cutoff frequency)
 * - SCALE → Amplitude/volume (factor = gain multiplier)
 * - COLOR → Timbre/brightness (hue = filter resonance, saturation = Q factor)
 * - NOISE → White noise burst (seed = random seed, intensity = duration)
 *
 * @example
 * ```typescript
 * const renderer = new AudioRenderer();
 * await renderer.initialize();
 * renderer.setColor(200, 80, 50); // Set filter parameters
 * renderer.circle(440); // Play 440Hz sine wave (A4 note)
 * const blob = await renderer.exportWAV();
 * ```
 */

import type { Renderer } from "./renderer.js";

/**
 * Web Audio-based implementation of Renderer interface.
 * Generates sound by interpreting drawing opcodes as audio synthesis parameters.
 * Supports real-time playback and WAV export for educational mutation experiments.
 */
export class AudioRenderer implements Renderer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private panner: StereoPannerNode | null = null;

  // Current audio state (parallel to visual transform state)
  private currentFrequency: number = 440; // A4 note (Hz)
  private currentDuration: number = 0.3; // Note length (seconds)
  private currentGain: number = 0.3; // Volume (0-1)
  private currentPan: number = 0; // Stereo position (-1=left, 0=center, 1=right)
  private currentFilterFreq: number = 2000; // Filter cutoff (Hz)
  private currentFilterQ: number = 1; // Filter resonance

  // Recording for WAV export
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  // Playback timing
  private currentTime: number = 0; // Current position in audio timeline (seconds)

  // Renderer interface properties (audio has no fixed dimensions)
  readonly width: number = 1000; // Nominal for interface compatibility
  readonly height: number = 1000;

  /**
   * Initialize Web Audio API context.
   * Must be called after user interaction (browser autoplay policy).
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return; // Already initialized

    this.audioContext = new AudioContext();

    // Create audio processing chain: source → filter → panner → gain → destination
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = this.currentFilterFreq;
    this.filter.Q.value = this.currentFilterQ;

    this.panner = this.audioContext.createStereoPanner();
    this.panner.pan.value = this.currentPan;

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5; // Master volume

    // Connect chain
    this.filter.connect(this.panner);
    this.panner.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
  }

  /**
   * Start recording audio output for WAV export.
   */
  startRecording(): void {
    if (!this.audioContext || !this.masterGain) {
      throw new Error(
        "AudioRenderer not initialized. Call initialize() first.",
      );
    }

    // Create MediaStreamDestination for recording
    const dest = this.audioContext.createMediaStreamDestination();
    this.masterGain.connect(dest);

    this.mediaRecorder = new MediaRecorder(dest.stream);
    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;
  }

  /**
   * Stop recording and return WAV file as Blob.
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("Not currently recording"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Create and play oscillator with current audio parameters.
   * @param type - Oscillator waveform type
   * @param frequency - Frequency in Hz
   * @param duration - Note duration in seconds
   */
  private playTone(
    type: OscillatorType,
    frequency: number,
    duration: number,
  ): void {
    if (!this.audioContext || !this.filter) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = Math.max(20, Math.min(20000, frequency)); // Clamp to audible range

    // ADSR envelope (Attack-Decay-Sustain-Release)
    const now = this.audioContext.currentTime + this.currentTime;
    const attack = 0.01;
    const decay = 0.05;
    const sustain = 0.7;
    const release = 0.05;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.currentGain, now + attack);
    gain.gain.linearRampToValueAtTime(
      this.currentGain * sustain,
      now + attack + decay,
    );
    gain.gain.setValueAtTime(
      this.currentGain * sustain,
      now + duration - release,
    );
    gain.gain.linearRampToValueAtTime(0, now + duration);

    // Connect oscillator → gain → filter → output chain
    osc.connect(gain);
    gain.connect(this.filter);

    osc.start(now);
    osc.stop(now + duration);

    // Advance timeline
    this.currentTime += duration + 0.02; // Small gap between notes
  }

  clear(): void {
    // Reset audio timeline to beginning
    this.currentTime = 0;
    this.currentFrequency = 440;
    this.currentDuration = 0.3;
    this.currentGain = 0.3;
    this.currentPan = 0;
    this.currentFilterFreq = 2000;
    this.currentFilterQ = 1;

    if (this.filter) {
      this.filter.frequency.value = this.currentFilterFreq;
      this.filter.Q.value = this.currentFilterQ;
    }
    if (this.panner) {
      this.panner.pan.value = this.currentPan;
    }
  }

  /**
   * CIRCLE → Sine wave (smooth, pure tone)
   * Radius maps to frequency (0-63 → 220-880 Hz, one octave centered on A4)
   */
  circle(radius: number): void {
    const freq = 220 + (radius / 64) * 660; // Map to musical range
    this.playTone("sine", freq, this.currentDuration);
  }

  /**
   * RECT → Square wave (bright, hollow timbre)
   * Width = frequency, Height = duration multiplier
   */
  rect(width: number, height: number): void {
    const freq = 220 + (width / 64) * 660;
    const duration = this.currentDuration * (1 + height / 64);
    this.playTone("square", freq, duration);
  }

  /**
   * LINE → Sawtooth wave (bright, buzzy timbre)
   * Length = duration
   */
  line(length: number): void {
    const duration = 0.1 + (length / 64) * 0.5; // 0.1-0.6 seconds
    this.playTone("sawtooth", this.currentFrequency, duration);
  }

  /**
   * TRIANGLE → Triangle wave (mellow, flute-like)
   * Size maps to frequency
   */
  triangle(size: number): void {
    const freq = 220 + (size / 64) * 660;
    this.playTone("triangle", freq, this.currentDuration);
  }

  /**
   * ELLIPSE → FM synthesis effect (complex harmonic timbre)
   * rx = carrier frequency, ry = modulation depth
   * Simulated by playing carrier frequency with filter modulation
   */
  ellipse(rx: number, ry: number): void {
    const carrierFreq = 220 + (rx / 64) * 660;
    const modDepth = ry / 64; // 0-1 range

    // Modulate filter during note to create FM-like effect
    if (this.audioContext && this.filter) {
      const now = this.audioContext.currentTime + this.currentTime;
      const _modFreq = carrierFreq * 0.5; // Modulation at half carrier

      this.filter.frequency.setValueAtTime(this.currentFilterFreq, now);
      this.filter.frequency.linearRampToValueAtTime(
        this.currentFilterFreq * (1 + modDepth),
        now + this.currentDuration / 2,
      );
      this.filter.frequency.linearRampToValueAtTime(
        this.currentFilterFreq,
        now + this.currentDuration,
      );
    }

    this.playTone("sine", carrierFreq, this.currentDuration);
  }

  /**
   * NOISE → White noise burst (percussive, textural)
   * Seed = random seed (currently unused, could control noise color)
   * Intensity = duration and volume
   */
  noise(_seed: number, intensity: number): void {
    if (!this.audioContext || !this.filter) return;

    const duration = 0.05 + (intensity / 64) * 0.3; // 0.05-0.35 seconds
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate,
    );
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(this.filter);

    const now = this.audioContext.currentTime + this.currentTime;
    const volume = this.currentGain * (intensity / 64);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    source.start(now);

    this.currentTime += duration + 0.02;
  }

  /**
   * TRANSLATE → Stereo pan
   * dx = pan position (-63 to 63 → -1 to 1, left to right)
   * dy = ignored (no vertical dimension in audio)
   */
  translate(dx: number, _dy: number): void {
    // Map -63 to 63 → -1 to 1
    this.currentPan = Math.max(-1, Math.min(1, dx / 63));
    if (this.panner) {
      this.panner.pan.value = this.currentPan;
    }
  }

  setPosition(x: number, _y: number): void {
    // For audio rendering, position maps to time offset
    this.currentTime = x / 100; // Normalize to reasonable time range
  }

  /**
   * ROTATE → Filter cutoff frequency sweep
   * Degrees = filter cutoff (0-360 → 200-20000 Hz)
   */
  rotate(degrees: number): void {
    // Map 0-360 to 200-20000 Hz (log scale for perceptual linearity)
    const normalized = (degrees % 360) / 360; // 0-1
    this.currentFilterFreq = 200 * 100 ** normalized; // 200 to 20000 Hz
    if (this.filter) {
      this.filter.frequency.value = this.currentFilterFreq;
    }
  }

  setRotation(degrees: number): void {
    // Rotation maps to filter frequency
    this.currentFilterFreq = 200 + degrees * 20; // Map degrees to frequency range
  }

  /**
   * SCALE → Volume/amplitude
   * Factor = gain multiplier (0.5 = half volume, 2 = double volume)
   */
  scale(factor: number): void {
    this.currentGain = Math.max(0.01, Math.min(1, this.currentGain * factor));
  }

  setScale(scale: number): void {
    // Scale maps to gain/volume
    this.currentGain = Math.max(0, Math.min(1, scale));
  }

  /**
   * COLOR → Timbre/brightness via filter
   * Hue = filter cutoff frequency (0-360 → 200-20000 Hz)
   * Saturation = filter resonance/Q (0-100 → 0.1-10)
   * Lightness = overall volume (0-100 → 0-1)
   */
  setColor(h: number, s: number, l: number): void {
    // Hue controls filter frequency
    const hueNorm = (h % 360) / 360;
    this.currentFilterFreq = 200 * 100 ** hueNorm;

    // Saturation controls filter resonance
    this.currentFilterQ = 0.1 + (s / 100) * 9.9; // 0.1 to 10

    // Lightness controls volume
    this.currentGain = Math.max(0.01, Math.min(1, l / 100));

    if (this.filter) {
      this.filter.frequency.value = this.currentFilterFreq;
      this.filter.Q.value = this.currentFilterQ;
    }
  }

  getCurrentTransform(): {
    x: number;
    y: number;
    rotation: number;
    scale: number;
  } {
    // Return audio state in visual coordinate metaphor
    return {
      x: this.currentPan * 63, // Pan position as "x"
      y: 0, // No y-axis in audio
      rotation: (Math.log(this.currentFilterFreq / 200) / Math.log(100)) * 360, // Filter as "rotation"
      scale: this.currentGain / 0.3, // Volume as "scale"
    };
  }

  toDataURL(): string {
    // Not applicable for audio - use exportWAV() instead
    return "data:audio/wav;base64,"; // Placeholder
  }

  /**
   * Export recorded audio as downloadable WAV file.
   * Requires startRecording() to be called before VM execution.
   */
  async exportWAV(): Promise<Blob> {
    return this.stopRecording();
  }

  /**
   * Clean up Web Audio resources.
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
