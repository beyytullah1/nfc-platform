'use server'

import prisma from '@/lib/db'
import { ModuleType } from '@/lib/types'
import { redirect } from 'next/navigation'

// =============================================
// TAG İŞLEMLERİ
// =============================================

/**
 * NFC tag kontrolü - Gateway middleware için
 */
export async function checkTag(publicCode: string) {
    const tag = await prisma.nfcTag.findUnique({
        where: { publicCode },
        include: {
            card: {
                select: {
                    id: true,
                    slug: true,
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            plant: true,
            mug: true,
            page: true,
            owner: {
                select: {
                    name: true
                }
            }
        },
    })

    if (!tag) {
        return { error: 'Etiket bulunamadı.' }
    }

    // Sahipsiz tag → Login'e yönlendir ve cookie'de sakla
    if (!tag.ownerId) {
        // Cookie'ye NFC kodunu kaydet (Next.js cookies API)
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        cookieStore.set('pending_nfc_code', publicCode, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 // 1 saat
        })

        return { redirect: `/login?from=nfc&code=${publicCode}` }
    }

    // Modüle göre yönlendir
    switch (tag.moduleType) {
        case 'card':
            // Slug varsa kullan, yoksa ID kullan
            const cardPath = tag.card?.slug || tag.card?.id
            return { redirect: `/c/${cardPath}` }
        case 'plant':
            return { redirect: `/p/${tag.plant?.id}` }
        case 'mug':
            return { redirect: `/m/${tag.mug?.id}` }
        case 'gift':
        case 'canvas':
            return { redirect: `/x/${tag.page?.id}` }
        default:
            return { redirect: `/claim?code=${publicCode}` }
    }
}

/**
 * Tag sahiplenme işlemi
 */
export async function claimTag(
    publicCode: string,
    userId: string,
    moduleType: ModuleType,
    name: string
) {
    const tag = await prisma.nfcTag.findUnique({
        where: { publicCode },
    })

    if (!tag) {
        return { error: 'Etiket bulunamadı.' }
    }

    if (tag.ownerId) {
        return { error: 'Bu etiket zaten sahiplenilmiş.' }
    }

    // Transaction ile tag'i sahiplen ve modül oluştur
    const result = await prisma.$transaction(async (tx) => {
        // Tag'i sahiplen
        await tx.nfcTag.update({
            where: { id: tag.id },
            data: {
                ownerId: userId,
                moduleType,
                claimedAt: new Date(),
            },
        })

        // Modüle göre kayıt oluştur
        let pageId: string | undefined

        switch (moduleType) {
            case 'card':
                const card = await tx.card.create({
                    data: {
                        userId,
                        tagId: tag.id,
                        title: name,
                    },
                })
                pageId = card.id
                break

            case 'plant':
                const plant = await tx.plant.create({
                    data: {
                        ownerId: userId,
                        tagId: tag.id,
                        name,
                    },
                })
                pageId = plant.id
                break

            case 'mug':
                const mug = await tx.mug.create({
                    data: {
                        ownerId: userId,
                        tagId: tag.id,
                        name,
                    },
                })
                pageId = mug.id
                break

            case 'gift':
            case 'canvas':
                const page = await tx.page.create({
                    data: {
                        ownerId: userId,
                        tagId: tag.id,
                        moduleType,
                        title: name,
                    },
                })
                pageId = page.id
                break
        }

        // Transfer kaydı oluştur
        await tx.ownershipTransfer.create({
            data: {
                tagId: tag.id,
                toUserId: userId,
                transferType: 'claim',
            },
        })

        return { pageId, moduleType }
    })

    // Modüle göre yönlendir
    const routeMap: Record<ModuleType, string> = {
        card: '/c',
        plant: '/p',
        mug: '/m',
        gift: '/x',
        canvas: '/x',
    }

    return { redirect: `${routeMap[moduleType]}/${result.pageId}` }
}

// =============================================
// KULLANICI İŞLEMLERİ
// =============================================

/**
 * Kullanıcı oluştur veya getir (anonim için)
 */
export async function getOrCreateAnonymousUser() {
    const user = await prisma.user.create({
        data: {
            email: `anon-${Date.now()}-${Math.random().toString(36).slice(2)}@nfc.local`,
        },
    })
    return user
}

// =============================================
// BİTKİ İŞLEMLERİ
// =============================================

/**
 * Bitki bilgilerini getir
 */
export async function getPlantWithLogs(id: string) {
    return prisma.plant.findUnique({
        where: { id },
        include: {
            owner: true,
            giftedBy: true,
            tag: true,
            logs: {
                orderBy: { createdAt: 'desc' },
                take: 20,
            },
        },
    })
}

/**
 * Sulama logu ekle
 */
export async function addWateringLog(plantId: string, amountMl?: number) {
    await prisma.plantLog.create({
        data: {
            plantId,
            logType: 'water',
            amountMl,
        },
    })
    return { success: true }
}

/**
 * Bitki sahiplik devri (Hediye)
 */
export async function transferPlantOwnership(
    plantId: string,
    newOwnerId: string,
    giftMessage?: string
) {
    const plant = await prisma.plant.findUnique({
        where: { id: plantId },
        include: { tag: true },
    })

    if (!plant) {
        return { error: 'Bitki bulunamadı.' }
    }

    const oldOwnerId = plant.ownerId

    await prisma.$transaction([
        // Bitki sahipliğini güncelle
        prisma.plant.update({
            where: { id: plantId },
            data: {
                ownerId: newOwnerId,
                isGift: true,
                giftedById: oldOwnerId,
                giftMessage,
            },
        }),
        // Tag sahipliğini güncelle
        prisma.nfcTag.update({
            where: { id: plant.tagId! },
            data: { ownerId: newOwnerId },
        }),
        // Transfer kaydı
        prisma.ownershipTransfer.create({
            data: {
                tagId: plant.tagId!,
                fromUserId: oldOwnerId,
                toUserId: newOwnerId,
                transferType: 'gift',
                message: giftMessage,
            },
        }),
        // Eski sahibine bildirim
        prisma.notification.create({
            data: {
                userId: oldOwnerId,
                senderId: newOwnerId,
                type: 'gift_claimed',
                title: 'Hediyen Sahiplenildi! 🎉',
                body: `${plant.name} yeni sahibine kavuştu.`,
            },
        }),
    ])

    return { success: true }
}

// =============================================
// KARTVİZİT İŞLEMLERİ
// =============================================

/**
 * Kartvizit bilgilerini getir (gizlilik filtreli)
 * idOrSlug parametresi hem id hem slug olabilir
 */
export async function getCardWithFields(
    idOrSlug: string,
    viewerId?: string,
    vipPassword?: string
) {
    // Önce slug ile ara, bulamazsan id ile ara
    let card = await prisma.card.findFirst({
        where: {
            OR: [
                { slug: idOrSlug },
                { id: idOrSlug }
            ]
        },
        include: {
            user: true,
            fields: {
                orderBy: { displayOrder: 'asc' },
            },
        },
    })

    if (!card) {
        return null
    }

    // Bağlantı kontrolü
    let isConnected = false
    if (viewerId && viewerId !== card.userId) {
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { userId: card.userId, friendId: viewerId, status: 'accepted' },
                    { userId: viewerId, friendId: card.userId, status: 'accepted' },
                ],
            },
        })
        isConnected = !!connection
    }

    const isOwner = viewerId === card.userId

    // Field'ları filtrele
    const filteredFields = card.fields.filter(field => {
        // Sahip her şeyi görebilir
        if (isOwner) return true

        // Privacy level kontrolü
        switch (field.privacyLevel) {
            case 0: // Public
                return true
            case 1: // Connections
                return isConnected
            case 2: // VIP
                // TODO: Password check
                return false
            case 3: // Private
                return false
            default:
                return false
        }
    })

    return {
        ...card,
        fields: filteredFields,
        isOwner,
        isConnected,
    }
}

/**
 * Bağlantı isteği gönder
 */
export async function sendConnectionRequest(
    userId: string,
    cardId: string, // Card ID zorunlu (card-based connection)
    categoryId?: string,
    meetingNote?: string
) {
    // Card sahibini bul
    const card = await prisma.card.findUnique({
        where: { id: cardId },
        select: { userId: true }
    })

    if (!card) {
        return { error: 'Kartvizit bulunamadı.' }
    }

    const friendId = card.userId

    // Kendi kartını kaydedemez
    if (userId === friendId) {
        return { error: 'Kendi kartınızı kaydedemezsiniz.' }
    }

    // Mevcut bağlantı kontrolü (aynı kartı daha önce kaydettiyse)
    const existing = await prisma.connection.findUnique({
        where: {
            userId_cardId: {
                userId,
                cardId
            }
        }
    })

    if (existing) {
        return { error: 'Bu kartı zaten kaydettiniz.' }
    }

    await prisma.$transaction([
        // Bağlantı oluştur
        prisma.connection.create({
            data: {
                userId,
                friendId,
                cardId,
                categoryId,
                meetingNote,
                status: 'saved', // Artık direkt saved
            },
        }),
        // Bildirim gönder
        prisma.notification.create({
            data: {
                userId: friendId,
                senderId: userId,
                type: 'connection_request',
                title: 'Kartvizitiniz Kaydedildi',
                body: 'Birisi kartvizitinizi ağına ekledi.',
            },
        }),
    ])

    return { success: true }
}
