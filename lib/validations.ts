/**
 * Zod validation schemas
 * Centralized input validation for API routes
 */

import { z } from 'zod'

/**
 * Username validation schema
 * - 3-20 characters
 * - Alphanumeric and underscore only
 * - Lowercase
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username en az 3 karakter olmalı')
  .max(20, 'Username en fazla 20 karakter olabilir')
  .regex(/^[a-z0-9_]+$/, 'Username sadece küçük harf, rakam ve _ içerebilir')

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Geçerli bir email adresi girin')
  .max(255, 'Email çok uzun')

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .max(100, 'Şifre çok uzun')

/**
 * Bio validation schema
 */
export const bioSchema = z
  .string()
  .max(500, 'Bio en fazla 500 karakter olabilir')
  .optional()
  .nullable()

/**
 * Module type validation
 */
export const moduleTypeSchema = z.enum(['card', 'plant', 'mug', 'gift', 'canvas'], {
  message: 'Geçersiz modül tipi'
})

/**
 * Claim NFC tag schema
 */
export const claimNFCSchema = z.object({
  code: z.string().min(1, 'Code gerekli').max(100),
  moduleType: moduleTypeSchema,
  name: z.string().min(1, 'İsim gerekli').max(200)
})

/**
 * Update user profile schema
 */
export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  bio: bioSchema,
  avatarUrl: z.string().url('Geçerli bir URL girin').optional().nullable(),
  name: z.string().min(1, 'İsim gerekli').max(100).optional()
})

/**
 * Create connection schema
 */
export const createConnectionSchema = z.object({
  cardId: z.string().min(1, 'Kart ID gerekli'),
  categoryId: z.string().optional().nullable(),
  myNote: z.string().max(1000, 'Not çok uzun').optional().nullable(),
  myTags: z.array(z.string()).max(20, 'Çok fazla etiket').optional(),
  savedPassword: z.string().max(100).optional().nullable()
})

/**
 * Update connection schema
 */
export const updateConnectionSchema = z.object({
  categoryId: z.string().optional().nullable(),
  myNote: z.string().max(1000, 'Not çok uzun').optional().nullable(),
  myTags: z.array(z.string()).max(20, 'Çok fazla etiket').optional()
})

/**
 * Transfer request schema
 */
export const transferRequestSchema = z.object({
  tagId: z.string().min(1, 'Tag ID gerekli'),
  targetUsername: z.string().min(1, 'Kullanıcı adı gerekli').max(50),
  message: z.string().max(500, 'Mesaj çok uzun').optional().nullable()
})

/**
 * Gift claim schema
 */
export const giftClaimSchema = z.object({
  giftId: z.string().min(1, 'Gift ID gerekli'),
  format: z.enum(['plant', 'mug', 'generic']),
  itemName: z.string().min(1, 'İsim gerekli').max(200)
})

/**
 * Upload type schema
 */
export const uploadTypeSchema = z.enum(['logo', 'avatar', 'vcard'], {
  message: 'Geçersiz upload tipi'
})

/**
 * Helper function to validate and parse request body
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  request: Request
): Promise<{ data?: T; error?: Response }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: new Response(
          JSON.stringify({
            error: 'Validation hatası',
            details: error.issues.map((e) => ({
              path: e.path.map(String).join('.'),
              message: e.message
            }))
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
    throw error
  }
}
