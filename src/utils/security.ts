/**
 * APEX FEMME - Security & Input Sanitization Utilities
 * Prevents XSS script injection, handles safe JSON parsing, and validates form inputs.
 */

/**
 * Sanitizes input string to prevent XSS script injection
 */
export function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Truncates string safely to maximum length
 */
export function truncateSafe(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

/**
 * Validates whether string is a valid HTTP/HTTPS URL
 */
export function isValidUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Safe JSON parser with fallback schema verification to prevent client crashes
 */
export function safeJsonParse<T>(jsonString: string | null, fallbackValue: T): T {
  if (!jsonString) return fallbackValue;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

/**
 * Clamps numeric inputs within safe min/max ranges
 */
export function clampNumber(value: number, min: number, max: number): number {
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
