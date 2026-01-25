/**
 * Formatting utilities
 */

/**
 * Format a date string as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${String(diffMinutes)} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${String(diffHours)} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays < 7) {
    return `${String(diffDays)} day${diffDays === 1 ? "" : "s"} ago`;
  } else if (diffWeeks < 4) {
    return `${String(diffWeeks)} week${diffWeeks === 1 ? "" : "s"} ago`;
  } else {
    return `${String(diffMonths)} month${diffMonths === 1 ? "" : "s"} ago`;
  }
}

/**
 * Format a date string as absolute date/time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i] ?? "B"}`;
}

/**
 * Format milliseconds to human-readable duration
 */
export function formatDuration(ms: number | undefined | null): string {
  if (ms === undefined || ms === null) return "0ms";
  if (ms < 1000) {
    return `${ms.toFixed(1)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(minutes)}m ${String(seconds)}s`;
  }
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString();
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number | undefined | null,
  decimals = 1,
): string {
  if (value === undefined || value === null) return "0%";
  return `${value.toFixed(decimals)}%`;
}
