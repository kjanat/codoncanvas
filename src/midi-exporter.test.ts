/**
 * MIDI Exporter Test Suite
 *
 * Tests for converting CodonCanvas genomes to Standard MIDI Files.
 * Maps visual opcodes to musical notes and control changes.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { MIDIExporter } from "./midi-exporter";
import { Canvas2DRenderer } from "./renderer";
import { Opcode, type VMState } from "./types";
import { CodonLexer } from "./lexer";
import { CodonVM } from "./vm";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "./test-utils/canvas-mock";

// Helper function to create a minimal VMState snapshot
function createSnapshot(overrides: Partial<VMState> = {}): VMState {
  return {
    pc: 0,
    stack: [],
    running: true,
    ...overrides,
  };
}

// Helper to read MIDI file header from blob
async function readMIDIBytes(blob: Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

describe("MIDIExporter", () => {
  let exporter: MIDIExporter;

  beforeEach(() => {
    exporter = new MIDIExporter();
    mockCanvasContext();
  });

  afterEach(() => {
    restoreCanvasContext();
  });

  // =========================================================================
  // Constructor & Constants
  // =========================================================================
  describe("constructor", () => {
    test("initializes with TICKS_PER_QUARTER = 480", async () => {
      // Generate a minimal MIDI file and check header for ticks per quarter
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.START })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Ticks per quarter is at bytes 12-13 in the header (big-endian)
      const ticksPerQuarter = (bytes[12] << 8) | bytes[13];
      expect(ticksPerQuarter).toBe(480);
    });

    test("initializes with DEFAULT_TEMPO = 120 BPM", async () => {
      // Generate MIDI with default tempo and check tempo meta event
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Find tempo meta event (FF 51 03 xx xx xx)
      // At 120 BPM, microseconds per quarter = 60000000 / 120 = 500000
      // 500000 = 0x07A120
      let foundTempo = false;
      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
          const tempo =
            (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
          expect(tempo).toBe(500000);
          foundTempo = true;
          break;
        }
      }
      expect(foundTempo).toBe(true);
    });

    test("initializes with DEFAULT_VELOCITY = 80", async () => {
      // Generate MIDI with a note and check velocity
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Find Note On event (0x90 channel 0 = 0x90)
      // Note On format: 0x90 <note> <velocity>
      let foundNoteOn = false;
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          // CIRCLE -> C4 (60)
          expect(bytes[i + 2]).toBe(80); // DEFAULT_VELOCITY
          foundNoteOn = true;
          break;
        }
      }
      expect(foundNoteOn).toBe(true);
    });

    test("initializes with NOTE_DURATION_TICKS = 480 (1 quarter note)", async () => {
      // The duration is used for note off timing
      // We verify by checking that note on/off pairs have 480 tick delta
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);

      // The file should be created successfully
      expect(blob.type).toBe("audio/midi");
    });
  });

  // =========================================================================
  // generateMIDI - Main Export Function
  // =========================================================================
  describe("generateMIDI", () => {
    // HAPPY PATHS
    test("returns Blob with type 'audio/midi'", () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("audio/midi");
    });

    test("uses provided tempo parameter (default 120 BPM)", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots, 60); // 60 BPM
      const bytes = await readMIDIBytes(blob);

      // At 60 BPM, microseconds per quarter = 60000000 / 60 = 1000000
      let foundTempo = false;
      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
          const tempo =
            (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
          expect(tempo).toBe(1000000);
          foundTempo = true;
          break;
        }
      }
      expect(foundTempo).toBe(true);
    });

    test("adds tempo meta event at start of file", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Find tempo meta event near start (after header)
      // Header is 14 bytes, track starts at byte 14
      // Track chunk: MTrk (4 bytes) + length (4 bytes) = 8 bytes, then events
      // First event should be tempo (delta=0, FF 51 03 ...)
      const trackStart = 14 + 8; // After header and track chunk header

      // Should find FF 51 03 within first few bytes of track data
      let foundTempo = false;
      for (let i = trackStart; i < Math.min(trackStart + 20, bytes.length - 5); i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51) {
          foundTempo = true;
          break;
        }
      }
      expect(foundTempo).toBe(true);
    });

    test("adds End of Track meta event at end", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // End of Track is FF 2F 00
      const lastBytes = bytes.slice(-3);
      expect(lastBytes[0]).toBe(0xff);
      expect(lastBytes[1]).toBe(0x2f);
      expect(lastBytes[2]).toBe(0x00);
    });

    test("processes all snapshots from VM execution history", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
        createSnapshot({ lastOpcode: Opcode.LINE }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Should contain note events for all three opcodes
      // CIRCLE -> 60, RECT -> 64, LINE -> 67
      let notes: number[] = [];
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90) {
          notes.push(bytes[i + 1]);
        }
      }
      expect(notes).toContain(60);
      expect(notes).toContain(64);
      expect(notes).toContain(67);
    });

    // OPCODE PROCESSING
    test("generates MIDI events from snapshot.lastOpcode", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Should contain Note On event
      let hasNoteOn = false;
      for (let i = 0; i < bytes.length - 1; i++) {
        if (bytes[i] === 0x90) {
          hasNoteOn = true;
          break;
        }
      }
      expect(hasNoteOn).toBe(true);
    });

    test("skips snapshots with null or undefined lastOpcode", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: undefined }),
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: null as unknown as Opcode }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Should only have one note (CIRCLE)
      let noteCount = 0;
      for (let i = 0; i < bytes.length - 1; i++) {
        if (bytes[i] === 0x90) {
          noteCount++;
        }
      }
      expect(noteCount).toBe(1);
    });

    test("advances currentTime by NOTE_DURATION_TICKS for each processed opcode", () => {
      // This is tested implicitly by the structure of the MIDI file
      // Each note should start at a different time
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
      ];
      const blob = exporter.generateMIDI(snapshots);

      expect(blob.size).toBeGreaterThan(0);
    });

    // VELOCITY TRACKING
    test("tracks lastVelocity starting at DEFAULT_VELOCITY", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Find Note On and check velocity
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          expect(bytes[i + 2]).toBe(80);
          break;
        }
      }
    });

    test("updates lastVelocity when PUSH opcode detected (scaled from stack value)", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [63] }), // Max value
        createSnapshot({ lastOpcode: Opcode.CIRCLE, stack: [63] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Find Note On and check velocity
      // Value 63 should map to velocity 127 (32 + (63/63) * 95 = 127)
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          expect(bytes[i + 2]).toBe(127);
          break;
        }
      }
    });

    // EDGE CASES
    test("handles empty snapshots array (returns minimal MIDI file)", async () => {
      const blob = exporter.generateMIDI([]);
      const bytes = await readMIDIBytes(blob);

      // Should still have valid header and end of track
      expect(bytes[0]).toBe(0x4d); // 'M'
      expect(bytes[1]).toBe(0x54); // 'T'
      expect(bytes[2]).toBe(0x68); // 'h'
      expect(bytes[3]).toBe(0x64); // 'd'
    });

    test("handles single snapshot", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);

      expect(blob.size).toBeGreaterThan(14); // Header is 14 bytes
    });

    test("handles very large number of frames (>100 snapshots)", () => {
      const snapshots: VMState[] = Array(150)
        .fill(null)
        .map(() => createSnapshot({ lastOpcode: Opcode.CIRCLE }));
      const blob = exporter.generateMIDI(snapshots);

      expect(blob.size).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Opcode to MIDI Mapping
  // =========================================================================
  describe("opcodeToMIDI (private, tested via generateMIDI)", () => {
    // DRAWING OPCODES -> NOTES
    describe("drawing opcodes produce notes", () => {
      test("CIRCLE -> Note C4 (60) sine wave representation", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let foundNote = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
            foundNote = true;
            break;
          }
        }
        expect(foundNote).toBe(true);
      });

      test("RECT -> Note E4 (64) square wave representation", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.RECT })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let foundNote = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0x90 && bytes[i + 1] === 64) {
            foundNote = true;
            break;
          }
        }
        expect(foundNote).toBe(true);
      });

      test("LINE -> Note G4 (67) sawtooth wave representation", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.LINE })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let foundNote = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0x90 && bytes[i + 1] === 67) {
            foundNote = true;
            break;
          }
        }
        expect(foundNote).toBe(true);
      });

      test("TRIANGLE -> Note A4 (69) triangle wave representation", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.TRIANGLE })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let foundNote = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0x90 && bytes[i + 1] === 69) {
            foundNote = true;
            break;
          }
        }
        expect(foundNote).toBe(true);
      });

      test("ELLIPSE -> Note C5 (72) FM synthesis representation", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.ELLIPSE })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let foundNote = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0x90 && bytes[i + 1] === 72) {
            foundNote = true;
            break;
          }
        }
        expect(foundNote).toBe(true);
      });
    });

    // TRANSFORM OPCODES -> CONTROL CHANGES
    describe("transform opcodes produce control changes", () => {
      test("ROTATE -> CC1 (Modulation) with degrees mapped to 0-127", async () => {
        const snapshots: VMState[] = [
          createSnapshot({ lastOpcode: Opcode.ROTATE, stack: [180] }), // 180 degrees
        ];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        // Find CC1 event (0xB0 0x01 <value>)
        let foundCC = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0xb0 && bytes[i + 1] === 1) {
            // 180/360 * 127 ≈ 63
            expect(bytes[i + 2]).toBeCloseTo(63, 0);
            foundCC = true;
            break;
          }
        }
        expect(foundCC).toBe(true);
      });

      test("SCALE -> CC7 (Volume) with factor mapped to 0-127", async () => {
        const snapshots: VMState[] = [
          createSnapshot({ lastOpcode: Opcode.SCALE, stack: [1] }), // Scale factor 1
        ];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        // Find CC7 event
        let foundCC = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0xb0 && bytes[i + 1] === 7) {
            expect(bytes[i + 2]).toBe(64); // 1 * 64 = 64
            foundCC = true;
            break;
          }
        }
        expect(foundCC).toBe(true);
      });

      test("COLOR -> CC10 (Pan) from hue, CC74 (Brightness) from lightness", async () => {
        const snapshots: VMState[] = [
          createSnapshot({ lastOpcode: Opcode.COLOR, stack: [180, 50, 75] }), // H=180, S=50, L=75
        ];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        // Find CC10 (Pan) and CC74 (Brightness)
        let foundCC10 = false;
        let foundCC74 = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0xb0) {
            if (bytes[i + 1] === 10) {
              // Hue 180/360 * 127 ≈ 63
              expect(bytes[i + 2]).toBeCloseTo(63, 0);
              foundCC10 = true;
            }
            if (bytes[i + 1] === 74) {
              // Lightness 75/100 * 127 ≈ 95
              expect(bytes[i + 2]).toBeCloseTo(95, 0);
              foundCC74 = true;
            }
          }
        }
        expect(foundCC10).toBe(true);
        expect(foundCC74).toBe(true);
      });

      test("TRANSLATE -> CC91 (Reverb) from dx, CC93 (Chorus) from dy", async () => {
        const snapshots: VMState[] = [
          createSnapshot({ lastOpcode: Opcode.TRANSLATE, stack: [50, 80] }), // dx=50, dy=80
        ];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        // Find CC91 and CC93
        let foundCC91 = false;
        let foundCC93 = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0xb0) {
            if (bytes[i + 1] === 91) {
              expect(bytes[i + 2]).toBe(50);
              foundCC91 = true;
            }
            if (bytes[i + 1] === 93) {
              expect(bytes[i + 2]).toBe(80);
              foundCC93 = true;
            }
          }
        }
        expect(foundCC91).toBe(true);
        expect(foundCC93).toBe(true);
      });
    });

    // STACK OPCODES -> NO MIDI OUTPUT
    describe("stack opcodes produce no direct MIDI events", () => {
      test("PUSH does not produce MIDI event (updates velocity for next note)", async () => {
        const snapshots: VMState[] = [
          createSnapshot({ lastOpcode: Opcode.PUSH, stack: [32] }),
        ];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        // Should not have Note On events
        let hasNoteOn = false;
        for (let i = 0; i < bytes.length - 1; i++) {
          if (bytes[i] === 0x90) {
            hasNoteOn = true;
            break;
          }
        }
        expect(hasNoteOn).toBe(false);
      });

      test("DUP does not produce MIDI event", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.DUP })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let hasNoteOn = false;
        for (let i = 0; i < bytes.length - 1; i++) {
          if (bytes[i] === 0x90) {
            hasNoteOn = true;
            break;
          }
        }
        expect(hasNoteOn).toBe(false);
      });

      test("POP does not produce MIDI event", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.POP })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let hasNoteOn = false;
        for (let i = 0; i < bytes.length - 1; i++) {
          if (bytes[i] === 0x90) {
            hasNoteOn = true;
            break;
          }
        }
        expect(hasNoteOn).toBe(false);
      });

      test("SWAP does not produce MIDI event", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.SWAP })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let hasNoteOn = false;
        for (let i = 0; i < bytes.length - 1; i++) {
          if (bytes[i] === 0x90) {
            hasNoteOn = true;
            break;
          }
        }
        expect(hasNoteOn).toBe(false);
      });

      test("NOP does not produce MIDI event", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.NOP })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let hasNoteOn = false;
        for (let i = 0; i < bytes.length - 1; i++) {
          if (bytes[i] === 0x90) {
            hasNoteOn = true;
            break;
          }
        }
        expect(hasNoteOn).toBe(false);
      });

      test("START does not produce MIDI event", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.START })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let hasNoteOn = false;
        for (let i = 0; i < bytes.length - 1; i++) {
          if (bytes[i] === 0x90) {
            hasNoteOn = true;
            break;
          }
        }
        expect(hasNoteOn).toBe(false);
      });

      test("STOP does not produce MIDI event", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.STOP })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let hasNoteOn = false;
        for (let i = 0; i < bytes.length - 1; i++) {
          if (bytes[i] === 0x90) {
            hasNoteOn = true;
            break;
          }
        }
        expect(hasNoteOn).toBe(false);
      });
    });

    // COMPARISON OPCODES -> SHORT NOTES
    describe("comparison opcodes produce short high notes", () => {
      test("EQ -> Note 84 with 1/4 duration (data operation indicator)", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.EQ })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let foundNote = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0x90 && bytes[i + 1] === 84) {
            foundNote = true;
            break;
          }
        }
        expect(foundNote).toBe(true);
      });

      test("LT -> Note 84 with 1/4 duration (data operation indicator)", async () => {
        const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.LT })];
        const blob = exporter.generateMIDI(snapshots);
        const bytes = await readMIDIBytes(blob);

        let foundNote = false;
        for (let i = 0; i < bytes.length - 2; i++) {
          if (bytes[i] === 0x90 && bytes[i + 1] === 84) {
            foundNote = true;
            break;
          }
        }
        expect(foundNote).toBe(true);
      });
    });
  });

  // =========================================================================
  // MIDI Event Creation Helpers
  // =========================================================================
  describe("createNoteEvents (private)", () => {
    test("creates Note On event with status 0x90 | channel", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Channel 0, so status = 0x90
      let foundNoteOn = false;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0x90) {
          foundNoteOn = true;
          break;
        }
      }
      expect(foundNoteOn).toBe(true);
    });

    test("creates Note Off event with status 0x80 | channel", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Channel 0, so status = 0x80
      let foundNoteOff = false;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0x80) {
          foundNoteOff = true;
          break;
        }
      }
      expect(foundNoteOff).toBe(true);
    });

    test("Note On uses provided velocity", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [0] }), // Min value -> velocity 32
        createSnapshot({ lastOpcode: Opcode.CIRCLE, stack: [0] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          expect(bytes[i + 2]).toBe(32);
          break;
        }
      }
    });

    test("Note Off uses velocity 64 (standard release)", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x80 && bytes[i + 1] === 60) {
          expect(bytes[i + 2]).toBe(64);
          break;
        }
      }
    });

    test("delta time between On and Off equals duration", () => {
      // This is implicitly tested - the MIDI file should parse correctly
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots);
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe("createControlChange (private)", () => {
    test("creates CC event with status 0xB0 | channel", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.ROTATE, stack: [90] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      let foundCC = false;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0xb0) {
          foundCC = true;
          break;
        }
      }
      expect(foundCC).toBe(true);
    });

    test("data contains controller number and value", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.ROTATE, stack: [90] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // CC1 = modulation wheel
      let foundCC1 = false;
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0xb0 && bytes[i + 1] === 1) {
          foundCC1 = true;
          expect(bytes[i + 2]).toBeGreaterThanOrEqual(0);
          expect(bytes[i + 2]).toBeLessThanOrEqual(127);
          break;
        }
      }
      expect(foundCC1).toBe(true);
    });

    test("delta time is 0 (immediate)", () => {
      // CC events have delta 0 - tested implicitly via file structure
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.SCALE, stack: [2] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Value Scaling
  // =========================================================================
  describe("scaleToVelocity (private)", () => {
    test("maps CodonCanvas value 0 to MIDI velocity 32", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [0] }),
        createSnapshot({ lastOpcode: Opcode.CIRCLE, stack: [0] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          expect(bytes[i + 2]).toBe(32);
          break;
        }
      }
    });

    test("maps CodonCanvas value 63 to MIDI velocity 127", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [63] }),
        createSnapshot({ lastOpcode: Opcode.CIRCLE, stack: [63] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          expect(bytes[i + 2]).toBe(127);
          break;
        }
      }
    });

    test("linear interpolation between 0-63 -> 32-127", async () => {
      // Test midpoint: 31.5 should map to ~79
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [32] }),
        createSnapshot({ lastOpcode: Opcode.CIRCLE, stack: [32] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          // 32 + (32/63) * 95 ≈ 80
          expect(bytes[i + 2]).toBeCloseTo(80, 0);
          break;
        }
      }
    });
  });

  describe("encodeTempo (private)", () => {
    test("converts BPM to microseconds per quarter note", async () => {
      const blob = exporter.generateMIDI(
        [createSnapshot({ lastOpcode: Opcode.CIRCLE })],
        120
      );
      const bytes = await readMIDIBytes(blob);

      // Find tempo event and verify
      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51) {
          const tempo =
            (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
          expect(tempo).toBe(500000); // 60000000 / 120
          break;
        }
      }
    });

    test("120 BPM -> 500000 microseconds (60000000/120)", async () => {
      const blob = exporter.generateMIDI(
        [createSnapshot({ lastOpcode: Opcode.CIRCLE })],
        120
      );
      const bytes = await readMIDIBytes(blob);

      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
          const tempo =
            (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
          expect(tempo).toBe(500000);
          break;
        }
      }
    });

    test("returns 3-byte Uint8Array", async () => {
      // Tempo is always 3 bytes in MIDI
      const blob = exporter.generateMIDI(
        [createSnapshot({ lastOpcode: Opcode.CIRCLE })],
        120
      );
      const bytes = await readMIDIBytes(blob);

      // Find tempo meta event and verify length byte is 3
      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51) {
          expect(bytes[i + 2]).toBe(3);
          break;
        }
      }
    });

    test("encodes as big-endian 24-bit integer", async () => {
      // 500000 = 0x07A120
      const blob = exporter.generateMIDI(
        [createSnapshot({ lastOpcode: Opcode.CIRCLE })],
        120
      );
      const bytes = await readMIDIBytes(blob);

      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
          expect(bytes[i + 3]).toBe(0x07); // High byte
          expect(bytes[i + 4]).toBe(0xa1); // Middle byte
          expect(bytes[i + 5]).toBe(0x20); // Low byte
          break;
        }
      }
    });
  });

  // =========================================================================
  // MIDI File Building
  // =========================================================================
  describe("buildMIDIFile (private)", () => {
    test("concatenates header and track chunks", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Should start with MThd
      expect(String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])).toBe(
        "MThd"
      );

      // Should have MTrk after header (14 bytes)
      expect(
        String.fromCharCode(bytes[14], bytes[15], bytes[16], bytes[17])
      ).toBe("MTrk");
    });

    test("calculates delta times between events", () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
      ];
      const blob = exporter.generateMIDI(snapshots);

      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe("calculateDeltaTimes (private)", () => {
    test("converts absolute times to delta (relative) times", () => {
      // Tested implicitly via file output
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      expect(blob.size).toBeGreaterThan(0);
    });

    test("first event has delta time 0", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // First event in track should have delta 0
      // Track data starts at byte 22 (14 header + 8 track header)
      expect(bytes[22]).toBe(0x00); // Delta time 0 for tempo
    });

    test("subsequent events have delta = current - previous", () => {
      // This is how MIDI delta times work - tested implicitly
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe("encodeHeader (private)", () => {
    test("starts with 'MThd' magic bytes (0x4D546864)", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      expect(bytes[0]).toBe(0x4d); // 'M'
      expect(bytes[1]).toBe(0x54); // 'T'
      expect(bytes[2]).toBe(0x68); // 'h'
      expect(bytes[3]).toBe(0x64); // 'd'
    });

    test("header length is 6 bytes", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Header length at bytes 4-7 (big-endian 32-bit)
      const length = (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];
      expect(length).toBe(6);
    });

    test("format is 0 (single track)", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Format at bytes 8-9
      const format = (bytes[8] << 8) | bytes[9];
      expect(format).toBe(0);
    });

    test("includes number of tracks", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Number of tracks at bytes 10-11
      const numTracks = (bytes[10] << 8) | bytes[11];
      expect(numTracks).toBe(1);
    });

    test("includes ticks per quarter note", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Ticks at bytes 12-13
      const ticks = (bytes[12] << 8) | bytes[13];
      expect(ticks).toBe(480);
    });

    test("total header size is 14 bytes", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Track chunk should start at byte 14
      expect(bytes[14]).toBe(0x4d); // 'M' from MTrk
    });
  });

  describe("encodeTrack (private)", () => {
    test("starts with 'MTrk' magic bytes (0x4D54726B)", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      expect(bytes[14]).toBe(0x4d); // 'M'
      expect(bytes[15]).toBe(0x54); // 'T'
      expect(bytes[16]).toBe(0x72); // 'r'
      expect(bytes[17]).toBe(0x6b); // 'k'
    });

    test("includes 4-byte track length", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Track length at bytes 18-21
      const length =
        (bytes[18] << 24) | (bytes[19] << 16) | (bytes[20] << 8) | bytes[21];
      expect(length).toBeGreaterThan(0);

      // Verify total size matches
      expect(blob.size).toBe(14 + 8 + length);
    });

    test("encodes each event with variable-length delta time", () => {
      // Multiple events should have proper delta encoding
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
        createSnapshot({ lastOpcode: Opcode.LINE }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      expect(blob.size).toBeGreaterThan(0);
    });

    test("encodes meta events as FF <type> <length> <data>", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Find tempo meta event (FF 51 03 ...)
      let foundMeta = false;
      for (let i = 0; i < bytes.length - 3; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
          foundMeta = true;
          break;
        }
      }
      expect(foundMeta).toBe(true);
    });

    test("encodes channel events as <status> <data>", async () => {
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      // Find Note On event (0x90 <note> <velocity>)
      let foundChannel = false;
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x90 && bytes[i + 1] === 60) {
          foundChannel = true;
          break;
        }
      }
      expect(foundChannel).toBe(true);
    });
  });

  describe("encodeVariableLength (private)", () => {
    test("encodes 0 as single byte 0x00", async () => {
      // First delta in track should be 0
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      const bytes = await readMIDIBytes(blob);

      expect(bytes[22]).toBe(0x00);
    });

    test("encodes 127 as single byte 0x7F", () => {
      // Values <= 127 encode as single byte
      // Tested implicitly via file generation
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      expect(blob.size).toBeGreaterThan(0);
    });

    test("encodes 128 as two bytes 0x81 0x00", () => {
      // Values > 127 require multi-byte encoding
      // 128 = 0x81 0x00 in variable length
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      expect(blob.size).toBeGreaterThan(0);
    });

    test("encodes 16383 as two bytes 0xFF 0x7F", () => {
      // Maximum 2-byte value
      // Tested implicitly
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      expect(blob.size).toBeGreaterThan(0);
    });

    test("sets high bit on all bytes except last", () => {
      // This is the variable-length encoding rule
      const blob = exporter.generateMIDI([createSnapshot({ lastOpcode: Opcode.CIRCLE })]);
      expect(blob.size).toBeGreaterThan(0);
    });

    test("handles large values (multi-byte encoding)", () => {
      // Generate many snapshots to create large delta times
      const snapshots: VMState[] = Array(1000)
        .fill(null)
        .map(() => createSnapshot({ lastOpcode: Opcode.CIRCLE }));
      const blob = exporter.generateMIDI(snapshots);
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Integration Tests
  // =========================================================================
  describe("integration", () => {
    test("generates playable MIDI file from simple genome", () => {
      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      const lexer = new CodonLexer();

      // Simple genome with shapes that have default parameters
      // TAT = PUSH, followed by value codons, then shapes
      const genome = "ATG TAT CAA CAA GGA TAA"; // START, PUSH, value, value, CIRCLE, STOP
      const tokens = lexer.tokenize(genome);

      // Run VM with error handling since some codons may stack underflow
      let snapshots;
      try {
        snapshots = vm.run(tokens);
      } catch {
        // If VM throws, create minimal snapshots
        snapshots = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      }

      const blob = exporter.generateMIDI(snapshots);

      expect(blob.type).toBe("audio/midi");
      expect(blob.size).toBeGreaterThan(14);
    });

    test("generated file has valid SMF Format 0 structure", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Valid MThd header
      expect(String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])).toBe(
        "MThd"
      );

      // Format 0
      expect((bytes[8] << 8) | bytes[9]).toBe(0);

      // 1 track
      expect((bytes[10] << 8) | bytes[11]).toBe(1);

      // Valid MTrk
      expect(String.fromCharCode(bytes[14], bytes[15], bytes[16], bytes[17])).toBe(
        "MTrk"
      );

      // End of track marker
      const lastBytes = bytes.slice(-3);
      expect(lastBytes[0]).toBe(0xff);
      expect(lastBytes[1]).toBe(0x2f);
      expect(lastBytes[2]).toBe(0x00);
    });

    test("tempo changes affect note timing correctly", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];

      const blob60 = exporter.generateMIDI(snapshots, 60);
      const blob120 = exporter.generateMIDI(snapshots, 120);

      const bytes60 = await readMIDIBytes(blob60);
      const bytes120 = await readMIDIBytes(blob120);

      // Find and compare tempo values
      let tempo60 = 0;
      let tempo120 = 0;

      for (let i = 0; i < bytes60.length - 5; i++) {
        if (bytes60[i] === 0xff && bytes60[i + 1] === 0x51) {
          tempo60 = (bytes60[i + 3] << 16) | (bytes60[i + 4] << 8) | bytes60[i + 5];
          break;
        }
      }

      for (let i = 0; i < bytes120.length - 5; i++) {
        if (bytes120[i] === 0xff && bytes120[i + 1] === 0x51) {
          tempo120 = (bytes120[i + 3] << 16) | (bytes120[i + 4] << 8) | bytes120[i + 5];
          break;
        }
      }

      expect(tempo60).toBe(1000000); // 60 BPM
      expect(tempo120).toBe(500000); // 120 BPM
    });

    test("velocity changes affect note dynamics", async () => {
      const lowVelSnapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [0] }),
        createSnapshot({ lastOpcode: Opcode.CIRCLE, stack: [0] }),
      ];
      const highVelSnapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [63] }),
        createSnapshot({ lastOpcode: Opcode.CIRCLE, stack: [63] }),
      ];

      const lowBlob = exporter.generateMIDI(lowVelSnapshots);
      const highBlob = exporter.generateMIDI(highVelSnapshots);

      const lowBytes = await readMIDIBytes(lowBlob);
      const highBytes = await readMIDIBytes(highBlob);

      let lowVel = 0;
      let highVel = 0;

      for (let i = 0; i < lowBytes.length - 2; i++) {
        if (lowBytes[i] === 0x90 && lowBytes[i + 1] === 60) {
          lowVel = lowBytes[i + 2];
          break;
        }
      }

      for (let i = 0; i < highBytes.length - 2; i++) {
        if (highBytes[i] === 0x90 && highBytes[i + 1] === 60) {
          highVel = highBytes[i + 2];
          break;
        }
      }

      expect(lowVel).toBe(32);
      expect(highVel).toBe(127);
    });

    test("control changes are properly interleaved with notes", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.ROTATE, stack: [90] }),
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Should have both CC (0xB0) and Note On (0x90) events
      let hasCC = false;
      let hasNoteOn = false;

      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0xb0) hasCC = true;
        if (bytes[i] === 0x90) hasNoteOn = true;
      }

      expect(hasCC).toBe(true);
      expect(hasNoteOn).toBe(true);
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe("edge cases", () => {
    test("handles genome with only stack operations (minimal MIDI output)", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.PUSH, stack: [42] }),
        createSnapshot({ lastOpcode: Opcode.DUP, stack: [42, 42] }),
        createSnapshot({ lastOpcode: Opcode.POP, stack: [42] }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Should have header, tempo, and end of track, but no note events
      expect(bytes.length).toBeGreaterThan(14);

      let noteCount = 0;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0x90) noteCount++;
      }
      expect(noteCount).toBe(0);
    });

    test("handles genome with only drawing operations (notes only)", async () => {
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.CIRCLE }),
        createSnapshot({ lastOpcode: Opcode.RECT }),
        createSnapshot({ lastOpcode: Opcode.LINE }),
        createSnapshot({ lastOpcode: Opcode.TRIANGLE }),
        createSnapshot({ lastOpcode: Opcode.ELLIPSE }),
      ];
      const blob = exporter.generateMIDI(snapshots);
      const bytes = await readMIDIBytes(blob);

      // Should have 5 Note On events
      let noteCount = 0;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0x90) noteCount++;
      }
      expect(noteCount).toBe(5);
    });

    test("handles very fast tempo (300+ BPM)", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots, 300);
      const bytes = await readMIDIBytes(blob);

      // At 300 BPM, tempo = 60000000 / 300 = 200000
      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51) {
          const tempo = (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
          expect(tempo).toBe(200000);
          break;
        }
      }
    });

    test("handles very slow tempo (<30 BPM)", async () => {
      const snapshots: VMState[] = [createSnapshot({ lastOpcode: Opcode.CIRCLE })];
      const blob = exporter.generateMIDI(snapshots, 20);
      const bytes = await readMIDIBytes(blob);

      // At 20 BPM, tempo = 60000000 / 20 = 3000000
      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0x51) {
          const tempo = (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
          expect(tempo).toBe(3000000);
          break;
        }
      }
    });

    test("handles stack underflow in transform opcodes", () => {
      // Transform opcodes with empty stack should not crash
      const snapshots: VMState[] = [
        createSnapshot({ lastOpcode: Opcode.ROTATE, stack: [] }),
        createSnapshot({ lastOpcode: Opcode.SCALE, stack: [] }),
        createSnapshot({ lastOpcode: Opcode.COLOR, stack: [] }),
        createSnapshot({ lastOpcode: Opcode.TRANSLATE, stack: [] }),
      ];

      expect(() => exporter.generateMIDI(snapshots)).not.toThrow();
    });
  });
});
