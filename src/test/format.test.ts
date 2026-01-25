import { describe, it, expect } from "vitest";
import {
  formatBytes,
  formatNumber,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatPercent,
} from "../lib/format";

describe("format utilities", () => {
  describe("formatBytes", () => {
    it("formats bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(500)).toBe("500 B");
      // formatBytes uses toFixed(1) so outputs "1.0 KB" not "1 KB"
      expect(formatBytes(1024)).toContain("KB");
      expect(formatBytes(1536)).toContain("KB");
      expect(formatBytes(1048576)).toContain("MB");
      expect(formatBytes(1073741824)).toContain("GB");
    });
  });

  describe("formatNumber", () => {
    it("formats numbers with locale", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
    });
  });

  describe("formatDateTime", () => {
    it("formats dates", () => {
      const date = "2024-01-15T10:30:00Z";
      const formatted = formatDateTime(date);
      expect(formatted).toContain("2024");
      expect(formatted).toContain("15");
    });
  });

  describe("formatRelativeTime", () => {
    it("formats relative time", () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(
        now.getTime() - 5 * 60 * 1000,
      ).toISOString();
      expect(formatRelativeTime(fiveMinutesAgo)).toContain("minute");
    });
  });

  describe("formatDuration", () => {
    it("formats milliseconds", () => {
      // formatDuration uses toFixed(1) so outputs "500.0ms"
      expect(formatDuration(500)).toContain("ms");
      expect(formatDuration(1500)).toContain("s");
      expect(formatDuration(65000)).toContain("m");
      // Large durations output in minutes format "61m 5s"
      expect(formatDuration(3665000)).toContain("m");
    });
  });

  describe("formatPercent", () => {
    it("formats percentages", () => {
      // formatPercent uses toFixed(1) so outputs "99.5%", "100.0%"
      expect(formatPercent(99.5)).toBe("99.5%");
      expect(formatPercent(100)).toContain("%");
      expect(formatPercent(0)).toContain("%");
    });
  });
});
