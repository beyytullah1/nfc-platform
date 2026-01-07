/**
 * Caching utilities using Next.js unstable_cache
 * For production-ready caching, consider Redis or similar
 */

import { unstable_cache } from 'next/cache'
import { prisma } from './db'

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  revalidate: 60, // 60 seconds default
  tags: {
    user: 'user',
    card: 'card',
    plant: 'plant',
    mug: 'mug',
    connection: 'connection',
    nfcTag: 'nfc-tag'
  }
} as const

/**
 * Get cached user by ID
 */
export function getCachedUser(userId: string) {
  return unstable_cache(
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true
        }
      })
    },
    [`user-${userId}`],
    {
      revalidate: CACHE_CONFIG.revalidate,
      tags: [CACHE_CONFIG.tags.user, `user-${userId}`]
    }
  )()
}

/**
 * Get cached user by username
 */
export function getCachedUserByUsername(username: string) {
  return unstable_cache(
    async () => {
      return prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true
        }
      })
    },
    [`user-username-${username}`],
    {
      revalidate: CACHE_CONFIG.revalidate,
      tags: [CACHE_CONFIG.tags.user, `user-username-${username}`]
    }
  )()
}

/**
 * Get cached card by ID or slug
 */
export function getCachedCard(idOrSlug: string) {
  return unstable_cache(
    async () => {
      return prisma.card.findFirst({
        where: {
          OR: [
            { id: idOrSlug },
            { slug: idOrSlug }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          fields: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      })
    },
    [`card-${idOrSlug}`],
    {
      revalidate: CACHE_CONFIG.revalidate,
      tags: [CACHE_CONFIG.tags.card, `card-${idOrSlug}`]
    }
  )()
}

/**
 * Get cached user cards
 */
export function getCachedUserCards(userId: string) {
  return unstable_cache(
    async () => {
      return prisma.card.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          avatarUrl: true,
          viewCount: true,
          createdAt: true
        }
      })
    },
    [`user-cards-${userId}`],
    {
      revalidate: CACHE_CONFIG.revalidate,
      tags: [CACHE_CONFIG.tags.card, CACHE_CONFIG.tags.user, `user-cards-${userId}`]
    }
  )()
}

/**
 * Get cached NFC tag by public code
 */
export function getCachedNFCTag(publicCode: string) {
  return unstable_cache(
    async () => {
      return prisma.nfcTag.findUnique({
        where: { publicCode },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true
            }
          },
          card: true,
          plant: true,
          mug: true,
          gift: true,
          page: true
        }
      })
    },
    [`nfc-tag-${publicCode}`],
    {
      revalidate: 30, // Shorter cache for NFC tags (more dynamic)
      tags: [CACHE_CONFIG.tags.nfcTag, `nfc-tag-${publicCode}`]
    }
  )()
}

/**
 * Helper to revalidate cache by tag
 * Note: This requires Next.js cache tag revalidation API
 * For now, we rely on time-based revalidation
 */
export function getCacheTags(entity: keyof typeof CACHE_CONFIG.tags, id?: string): string[] {
  const tags = [CACHE_CONFIG.tags[entity]]
  if (id) {
    tags.push(`${entity}-${id}`)
  }
  return tags
}
