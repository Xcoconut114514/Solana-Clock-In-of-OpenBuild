/**
 * Polyfills for Solana wallet adapters
 * Required for browser compatibility with Node.js modules
 */

import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

// Ensure global is defined
if (typeof window.global === 'undefined') {
  window.global = window;
}
