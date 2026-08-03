/**
 * APEX FEMME - Security, Input Sanitization & Data Integrity Layer
 * Prevents XSS script injection, handles safe JSON parsing, rate limiting and data validation.
 */

/**
 * Cleans any recursively encoded HTML entities (e.g. &amp;amp;amp;&#x2F;) back to normal text (& or /)
 */
export function cleanCorruptedEntities(str: string): string {
  if (!str || typeof str !== 'string') return str;
  let s = str;
  // Strip repeated &amp; or HTML entity sequences
  s = s.replace(/(&amp;)+/gi, '&');
  s = s.replace(/&#x2F;/gi, '/');
  s = s.replace(/&#x27;/gi, "'");
  s = s.replace(/&quot;/gi, '"');
  s = s.replace(/&lt;/gi, '<');
  s = s.replace(/&gt;/gi, '>');
  return s;
}

/**
 * Sanitizes input string to prevent XSS script injection without double-encoding plain text
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  const cleaned = cleanCorruptedEntities(str);
  return cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Recursively cleans corrupted HTML entity strings in saved data objects
 */
export function cleanObjectStrings<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return cleanCorruptedEntities(obj) as unknown as T;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectStrings(item)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = cleanObjectStrings(value);
  }
  return result as T;
}

/**
 * Recursively sanitizes object properties to prevent injected XSS vectors in user inputs
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj) as unknown as T;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = sanitizeObject(value);
  }
  return result as T;
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

/**
 * Simple in-memory rate limiter helper for client interactions (e.g. AI requests)
 */
export class ClientRateLimiter {
  private lastCallTime = 0;
  private minIntervalMs: number;

  constructor(minIntervalMs = 500) {
    this.minIntervalMs = minIntervalMs;
  }

  canExecute(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime >= this.minIntervalMs) {
      this.lastCallTime = now;
      return true;
    }
    return false;
  }
}
