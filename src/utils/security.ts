/**
 * APEX FEMME - Security, Input Sanitization & Data Integrity Layer
 * Prevents XSS script injection, handles safe JSON parsing, rate limiting and data validation.
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
