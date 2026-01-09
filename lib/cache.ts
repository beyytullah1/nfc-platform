import { unstable_cache } from 'next/cache'
import { prisma } from './db'

/**
 * Cached database queries for performance optimization
 * Uses Next.js unstable_cache with appropriate revalidation times
 */

// Cache user by ID (5 minutes)
export const getCachedUser = unstable_cache(
  async (userId: string) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        role: true,
      }
    })
  },
  ['user-by-id'],
  { revalidate: 300, tags: ['user'] }
)

// Cache card by slug (10 minutes for public cards)
export const getCachedCardBySlug = unstable_cache(
  async (slug: string) => {
    return await prisma.card.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
          }
        },
        fields: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            group: true
          }
        },
        groups: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })
  },
  ['card-by-slug'],
  { revalidate: 600, tags: ['card'] }
)

// Cache popular cards (1 hour)
export const getCachedPopularCards = unstable_cache(
  async (limit: number = 10) => {
    return await prisma.card.findMany({
      where: { isPublic: true },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        avatarUrl: true,
        viewCount: true,
        user: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })
  },
  ['popular-cards'],
  { revalidate: 3600, tags: ['cards-list'] }
)

// Cache NFC tag by public code (15 minutes)
export const getCachedNfcTag = unstable_cache(
  async (publicCode: string) => {
    return await prisma.nfcTag.findUnique({
      where: { publicCode },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
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
  ['nfc-tag-by-code'],
  { revalidate: 900, tags: ['nfc-tag'] }
)

// Cache user's cards (5 minutes)
export const getCachedUserCards = unstable_cache(
  async (userId: string) => {
    return await prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        avatarUrl: true,
        isPublic: true,
        viewCount: true,
        createdAt: true
      }
    })
  },
  ['user-cards'],
  { revalidate: 300, tags: ['user-cards'] }
)

// Cache stats (30 minutes)
export const getCachedStats = unstable_cache(
  async () => {
    const [userCount, cardCount, plantCount, nfcTagCount] = await Promise.all([
      prisma.user.count(),
      prisma.card.count(),
      prisma.plant.count(),
      prisma.nfcTag.count()
    ])

    return {
      users: userCount,
      cards: cardCount,
      plants: plantCount,
      nfcTags: nfcTagCount
    }
  },
  ['platform-stats'],
  { revalidate: 1800, tags: ['stats'] }
)

/**
 * Cache invalidation helpers
 * Use these after mutations to invalidate specific caches
 */
export const cacheInvalidation = {
  user: (userId: string) => {
    // Invalidate user-specific caches
    // Note: unstable_cache doesn't have direct invalidation yet
    // Use revalidateTag in server actions instead
  },
  card: (cardId: string) => {
    // Invalidate card-specific caches
  },
  all: () => {
    // Invalidate all caches
  }
}
