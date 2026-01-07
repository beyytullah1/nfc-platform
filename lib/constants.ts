/**
 * Application constants
 * Centralized configuration values
 */

/**
 * File upload constants
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/vcard',
    'text/x-vcard'
  ] as const,
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'vcf'] as const
} as const

/**
 * Card theme defaults
 */
export const CARD_THEMES = {
  default: JSON.stringify({ color: '#3b82f6', style: 'modern' }),
  modern: JSON.stringify({ color: '#2ecc71', style: 'modern' }),
  nature: JSON.stringify({ style: 'nature' }),
  romantic: JSON.stringify({ color: '#e74c3c', style: 'romantic' })
} as const

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const

/**
 * Validation limits
 */
export const VALIDATION_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  BIO_MAX: 500,
  NAME_MAX: 100,
  NOTE_MAX: 1000,
  TAGS_MAX: 20,
  MESSAGE_MAX: 500
} as const

/**
 * Magic number signatures for file type validation
 */
export const FILE_SIGNATURES = {
  JPEG: [0xFF, 0xD8, 0xFF],
  PNG: [0x89, 0x50, 0x4E, 0x47],
  GIF: [0x47, 0x49, 0x46, 0x38],
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46], // Starts with RIFF
  VCARD_PREFIX: 'BEGIN:VCARD'
} as const
