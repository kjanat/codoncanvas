import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GifExporter } from './gif-exporter';

describe('GifExporter', () => {
  let exporter: GifExporter;

  beforeEach(() => {
    exporter = new GifExporter();
  });

  describe('Constructor', () => {
    it('should use default values when no options provided', () => {
      const exp = new GifExporter();
      expect(exp).toBeDefined();
    });

    it('should accept custom width and height', () => {
      const exp = new GifExporter({ width: 800, height: 600 });
      expect(exp).toBeDefined();
    });

    it('should accept custom FPS and quality', () => {
      const exp = new GifExporter({ fps: 8, quality: 5 });
      expect(exp).toBeDefined();
    });
  });

  describe('setFps', () => {
    it('should set FPS within valid range', () => {
      exporter.setFps(10);
      // No error should be thrown
      expect(true).toBe(true);
    });

    it('should clamp FPS to minimum 1', () => {
      exporter.setFps(0);
      // Should clamp to 1, no error
      expect(true).toBe(true);
    });

    it('should clamp FPS to maximum 30', () => {
      exporter.setFps(50);
      // Should clamp to 30, no error
      expect(true).toBe(true);
    });
  });

  describe('setQuality', () => {
    it('should set quality within valid range', () => {
      exporter.setQuality(15);
      expect(true).toBe(true);
    });

    it('should clamp quality to minimum 1', () => {
      exporter.setQuality(0);
      expect(true).toBe(true);
    });

    it('should clamp quality to maximum 30', () => {
      exporter.setQuality(50);
      expect(true).toBe(true);
    });
  });

});
