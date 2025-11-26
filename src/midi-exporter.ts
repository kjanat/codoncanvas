/**
 * MIDI file export implementation for CodonCanvas.
 * Converts CodonCanvas genomes to MIDI files for professional music software integration.
 *
 * OPCODE → MIDI MAPPING:
 * Drawing Primitives (Notes):
 * - CIRCLE → C4 (60) - Fundamental tone
 * - RECT → E4 (64) - Major third
 * - LINE → G4 (67) - Perfect fifth
 * - TRIANGLE → A4 (69) - Major sixth
 * - ELLIPSE → C5 (72) - Octave
 *
 * Transform Operations (Control Changes):
 * - ROTATE → CC1 (Modulation Wheel)
 * - SCALE → CC7 (Volume)
 * - COLOR → CC10 (Pan) + CC74 (Brightness)
 * - TRANSLATE → CC91 (Reverb) + CC93 (Chorus)
 *
 * Stack Operations:
 * - PUSH → Set velocity for next note (value 0-63 → velocity 32-127)
 * - DUP → Duplicate previous note
 *
 * @example
 * ```typescript
 * const exporter = new MIDIExporter();
 * const snapshots = vm.run(tokens);
 * const midiBlob = exporter.generateMIDI(snapshots);
 * // Import into GarageBand, Ableton, Logic, etc.
 * ```
 */

import type { VMState } from "./types.js";
import { Opcode } from "./types.js";

/**
 * MIDI file generator for CodonCanvas genomes.
 * Generates Standard MIDI File (SMF) Format 0 (single track).
 */
export class MIDIExporter {
  private readonly TICKS_PER_QUARTER = 480; // Standard MIDI timing resolution
  private readonly DEFAULT_TEMPO = 120; // BPM
  private readonly DEFAULT_VELOCITY = 80; // MIDI velocity (0-127)
  private readonly NOTE_DURATION_TICKS = 480; // 1 quarter note per instruction

  /**
   * Generate MIDI file from VM execution history.
   * @param snapshots VM state snapshots (one per instruction)
   * @param tempo Tempo in BPM (default: 120)
   * @returns MIDI file as Blob
   */
  generateMIDI(snapshots: VMState[], tempo: number = this.DEFAULT_TEMPO): Blob {
    const events: MIDIEvent[] = [];
    let currentTime = 0; // Time in ticks
    let lastVelocity = this.DEFAULT_VELOCITY;

    // Add tempo meta event at start
    events.push({
      deltaTime: 0,
      type: "meta",
      metaType: 0x51, // Set Tempo
      data: this.encodeTempo(tempo),
    });

    // Process each snapshot to generate MIDI events
    for (const snapshot of snapshots) {
      // Use tracked opcode from VM execution
      const opcode = snapshot.lastOpcode;

      if (opcode !== undefined && opcode !== null) {
        const midiEvents = this.opcodeToMIDI(
          opcode,
          snapshot,
          currentTime,
          lastVelocity,
        );
        events.push(...midiEvents);

        // Update velocity if PUSH detected
        if (opcode === Opcode.PUSH && snapshot.stack.length > 0) {
          const pushValue = snapshot.stack[snapshot.stack.length - 1];
          lastVelocity = this.scaleToVelocity(pushValue);
        }

        currentTime += this.NOTE_DURATION_TICKS;
      }
    }

    // Add End of Track meta event
    events.push({
      deltaTime: currentTime,
      type: "meta",
      metaType: 0x2f,
      data: new Uint8Array(0),
    });

    // Build MIDI file
    const midiData = this.buildMIDIFile(events);
    // Cast to BlobPart for type safety
    return new Blob([midiData as BlobPart], { type: "audio/midi" });
  }

  /**
   * Convert opcode to MIDI event(s).
   */
  private opcodeToMIDI(
    opcode: Opcode,
    state: VMState,
    time: number,
    velocity: number,
  ): MIDIEvent[] {
    const events: MIDIEvent[] = [];
    const channel = 0; // MIDI channel 1 (0-indexed)

    switch (opcode) {
      // Drawing opcodes → Notes
      case Opcode.CIRCLE:
        events.push(
          ...this.createNoteEvents(
            60,
            velocity,
            time,
            this.NOTE_DURATION_TICKS,
            channel,
          ),
        );
        break;

      case Opcode.RECT:
        events.push(
          ...this.createNoteEvents(
            64,
            velocity,
            time,
            this.NOTE_DURATION_TICKS,
            channel,
          ),
        );
        break;

      case Opcode.LINE:
        events.push(
          ...this.createNoteEvents(
            67,
            velocity,
            time,
            this.NOTE_DURATION_TICKS,
            channel,
          ),
        );
        break;

      case Opcode.TRIANGLE:
        events.push(
          ...this.createNoteEvents(
            69,
            velocity,
            time,
            this.NOTE_DURATION_TICKS,
            channel,
          ),
        );
        break;

      case Opcode.ELLIPSE:
        events.push(
          ...this.createNoteEvents(
            72,
            velocity,
            time,
            this.NOTE_DURATION_TICKS,
            channel,
          ),
        );
        break;

      // Transform opcodes → Control Changes
      case Opcode.ROTATE:
        if (state.stack.length > 0) {
          const degrees = state.stack[state.stack.length - 1];
          const ccValue = Math.floor(((degrees % 360) / 360) * 127);
          events.push(this.createControlChange(1, ccValue, time, channel)); // Modulation
        }
        break;

      case Opcode.SCALE:
        if (state.stack.length > 0) {
          const factor = state.stack[state.stack.length - 1];
          const ccValue = Math.min(127, Math.floor(factor * 64));
          events.push(this.createControlChange(7, ccValue, time, channel)); // Volume
        }
        break;

      case Opcode.COLOR:
        if (state.stack.length >= 3) {
          const [h, _s, l] = state.stack.slice(-3);
          const panValue = Math.floor(((h % 360) / 360) * 127);
          const brightnessValue = Math.floor((l / 100) * 127);
          events.push(this.createControlChange(10, panValue, time, channel)); // Pan
          events.push(
            this.createControlChange(74, brightnessValue, time, channel),
          ); // Brightness
        }
        break;

      case Opcode.TRANSLATE:
        if (state.stack.length >= 2) {
          const [dx, dy] = state.stack.slice(-2);
          const reverbValue = Math.min(127, Math.abs(Math.floor(dx)));
          const chorusValue = Math.min(127, Math.abs(Math.floor(dy)));
          events.push(this.createControlChange(91, reverbValue, time, channel)); // Reverb
          events.push(this.createControlChange(93, chorusValue, time, channel)); // Chorus
        }
        break;

      // Stack/control opcodes don't generate MIDI events directly
      case Opcode.PUSH:
      case Opcode.DUP:
      case Opcode.POP:
      case Opcode.SWAP:
      case Opcode.NOP:
      case Opcode.START:
      case Opcode.STOP:
        break;

      case Opcode.EQ:
      case Opcode.LT:
        // Comparison opcodes → short high note (data operations)
        events.push(
          ...this.createNoteEvents(
            84,
            velocity,
            time,
            this.NOTE_DURATION_TICKS / 4,
            channel,
          ),
        );
        break;
    }

    return events;
  }

  /**
   * Create Note On + Note Off events for a MIDI note.
   */
  private createNoteEvents(
    note: number,
    velocity: number,
    _startTime: number,
    duration: number,
    channel: number,
  ): MIDIEvent[] {
    return [
      {
        deltaTime: 0,
        type: "channel",
        status: 0x90 | channel, // Note On
        data: new Uint8Array([note, velocity]),
      },
      {
        deltaTime: duration,
        type: "channel",
        status: 0x80 | channel, // Note Off
        data: new Uint8Array([note, 64]),
      },
    ];
  }

  /**
   * Create Control Change event.
   */
  private createControlChange(
    controller: number,
    value: number,
    _time: number,
    channel: number,
  ): MIDIEvent {
    return {
      deltaTime: 0,
      type: "channel",
      status: 0xb0 | channel, // Control Change
      data: new Uint8Array([controller, value]),
    };
  }

  /**
   * Scale CodonCanvas value (0-63) to MIDI velocity (32-127).
   */
  private scaleToVelocity(value: number): number {
    return Math.floor(32 + (value / 63) * 95);
  }

  /**
   * Encode tempo (BPM) as MIDI meta event data.
   */
  private encodeTempo(bpm: number): Uint8Array {
    const microsecondsPerQuarter = Math.floor(60000000 / bpm);
    return new Uint8Array([
      (microsecondsPerQuarter >> 16) & 0xff,
      (microsecondsPerQuarter >> 8) & 0xff,
      microsecondsPerQuarter & 0xff,
    ]);
  }

  /**
   * Build complete MIDI file from events.
   */
  private buildMIDIFile(events: MIDIEvent[]): Uint8Array {
    // Calculate delta times between events
    const timedEvents = this.calculateDeltaTimes(events);

    // Encode track chunk
    const trackData = this.encodeTrack(timedEvents);

    // Build MIDI file: Header + Track
    const header = this.encodeHeader(1, this.TICKS_PER_QUARTER);
    const fileSize = header.length + trackData.length;
    const midiFile = new Uint8Array(fileSize);

    midiFile.set(header, 0);
    midiFile.set(trackData, header.length);

    return midiFile;
  }

  /**
   * Calculate delta times between consecutive events.
   */
  private calculateDeltaTimes(events: MIDIEvent[]): MIDIEvent[] {
    const result: MIDIEvent[] = [];
    let lastTime = 0;

    for (const event of events) {
      const deltaTime = event.deltaTime - lastTime;
      result.push({ ...event, deltaTime });
      lastTime = event.deltaTime;
    }

    return result;
  }

  /**
   * Encode MIDI file header chunk.
   */
  private encodeHeader(numTracks: number, ticksPerQuarter: number): Uint8Array {
    const header = new Uint8Array(14);
    const view = new DataView(header.buffer);

    // "MThd"
    header[0] = 0x4d;
    header[1] = 0x54;
    header[2] = 0x68;
    header[3] = 0x64;

    view.setUint32(4, 6); // Header length
    view.setUint16(8, 0); // Format 0 (single track)
    view.setUint16(10, numTracks); // Number of tracks
    view.setUint16(12, ticksPerQuarter); // Ticks per quarter note

    return header;
  }

  /**
   * Encode MIDI track chunk.
   */
  private encodeTrack(events: MIDIEvent[]): Uint8Array {
    // Encode all events
    const eventData: number[] = [];

    for (const event of events) {
      // Encode delta time (variable length quantity)
      const deltaBytes = this.encodeVariableLength(event.deltaTime);
      eventData.push(...deltaBytes);

      if (event.type === "meta" && event.metaType !== undefined) {
        // Meta event: FF <type> <length> <data>
        eventData.push(0xff, event.metaType, event.data.length, ...event.data);
      } else if (event.type === "channel" && event.status !== undefined) {
        // Channel event: <status> <data>
        eventData.push(event.status, ...event.data);
      }
    }

    // Build track chunk: "MTrk" + length + data
    const trackChunk = new Uint8Array(8 + eventData.length);
    const view = new DataView(trackChunk.buffer);

    // "MTrk"
    trackChunk[0] = 0x4d;
    trackChunk[1] = 0x54;
    trackChunk[2] = 0x72;
    trackChunk[3] = 0x6b;

    view.setUint32(4, eventData.length); // Track length
    trackChunk.set(eventData, 8);

    return trackChunk;
  }

  /**
   * Encode variable-length quantity (MIDI delta time format).
   */
  private encodeVariableLength(value: number): number[] {
    const bytes: number[] = [];
    let remaining = value;
    let buffer = remaining & 0x7f;

    remaining >>= 7;
    while (remaining > 0) {
      bytes.unshift((buffer & 0x7f) | 0x80);
      buffer = remaining & 0x7f;
      remaining >>= 7;
    }

    bytes.push(buffer);
    return bytes;
  }
}

/**
 * MIDI event types.
 */
interface MIDIEvent {
  deltaTime: number; // Time offset in ticks
  type: "channel" | "meta";
  status?: number; // For channel events
  metaType?: number; // For meta events
  data: Uint8Array;
}
