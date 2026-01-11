'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

/**
 * Create a new gift
 * SECURITY: Gifts do NOT create NFC tags - they link to EXISTING tags only
 * NFC tags can only be created via admin panel
 */
export async function createGift(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const title = formData.get("title") as string
    const message = formData.get("message") as string
    const giftType = formData.get("giftType") as string
    const mediaUrl = formData.get("mediaUrl") as string
    const spotifyUrl = formData.get("spotifyUrl") as string
    const senderName = formData.get("senderName") as string
    const password = formData.get("password") as string
    const passwordHint = formData.get("passwordHint") as string
    const tagCode = formData.get("tagCode") as string // Existing NFC tag public code

    // Password is REQUIRED for gifts
    if (!password || password.trim().length < 1) {
        throw new Error("Hediye için şifre zorunludur")
    }

    try {
        let tagId: string | null = null

        // If NFC tag code provided, verify it exists and is unlinked
        if (tagCode && tagCode.trim()) {
            const existingTag = await prisma.nfcTag.findUnique({
                where: { publicCode: tagCode },
                select: { id: true, ownerId: true, gift: true }
            })

            if (!existingTag) {
                throw new Error("Bu NFC etiket kodu sistemde bulunamadı. Lütfen admin panelinden oluşturulmuş bir etiket kullanın.")
            }

            if (existingTag.gift) {
                throw new Error("Bu NFC etiketi zaten başka bir hediyeye bağlı.")
            }

            // Link tag to this user
            await prisma.nfcTag.update({
                where: { id: existingTag.id },
                data: {
                    ownerId: session.user!.id,
                    moduleType: "gift"
                }
            })

            tagId = existingTag.id
        }

        // Create Gift (optionally linked to NFC tag)
        const gift = await prisma.gift.create({
            data: {
                senderId: session.user!.id,
                tagId: tagId,
                title,
                message,
                giftType,
                mediaUrl: mediaUrl || null,
                spotifyUrl: spotifyUrl || null,
                senderName: senderName || null,
                password: password, // Required
                passwordHint: passwordHint || null,
            }
        })

        revalidatePath("/dashboard/gifts")
        return { success: true, giftId: gift.id }
    } catch (error) {
        logger.error("Create gift error", { context: "GiftActions", error })
        throw error
    }
}

export async function updateGift(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const title = formData.get("title") as string
    const message = formData.get("message") as string
    const giftType = formData.get("giftType") as string
    const mediaUrl = formData.get("mediaUrl") as string
    const spotifyUrl = formData.get("spotifyUrl") as string
    const senderName = formData.get("senderName") as string
    const password = formData.get("password") as string
    const passwordHint = formData.get("passwordHint") as string

    try {
        await prisma.gift.update({
            where: {
                id,
                senderId: session.user!.id
            },
            data: {
                title,
                message,
                giftType,
                mediaUrl: mediaUrl || null,
                spotifyUrl: spotifyUrl || null,
                senderName: senderName || null,
                ...(password && { password }),
                passwordHint: passwordHint || null,
            }
        })

        revalidatePath("/dashboard/gifts")
        revalidatePath(`/dashboard/gifts/${id}`)
        return { success: true }
    } catch (error) {
        logger.error("Update gift error", { context: "GiftActions", error })
        throw new Error("Failed to update gift")
    }
}

export async function deleteGift(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        // Get gift to find associated tag
        const gift = await prisma.gift.findUnique({
            where: { id, senderId: session.user!.id },
            select: { tagId: true }
        })

        if (!gift) {
            throw new Error("Gift not found")
        }

        // Delete gift first
        await prisma.gift.delete({
            where: { id }
        })

        // Unlink tag (but don't delete it - admin should manage tags)
        if (gift.tagId) {
            await prisma.nfcTag.update({
                where: { id: gift.tagId },
                data: {
                    moduleType: null,
                    gift: { disconnect: true }
                }
            })
        }

        revalidatePath("/dashboard/gifts")
        redirect("/dashboard/gifts")
    } catch (error) {
        logger.error("Delete gift error", { context: "GiftActions", error })
        throw new Error("Failed to delete gift")
    }
}

export async function getGiftContent(publicCode: string, password?: string) {
    try {
        // Find by NFC tag code or gift ID
        let gift = null

        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode },
            include: {
                gift: {
                    include: { sender: true }
                }
            }
        })

        if (tag?.gift) {
            gift = tag.gift
        } else {
            gift = await prisma.gift.findFirst({
                where: {
                    OR: [
                        { id: publicCode },
                        { slug: publicCode }
                    ]
                },
                include: { sender: true }
            })
        }

        if (!gift) {
            return { success: false, error: 'Hediye bulunamadı' }
        }

        // Check password if gift has one
        if (gift.password) {
            if (!password) {
                return { success: false, error: 'Bu hediye şifre korumalı', requiresPassword: true }
            }
            if (password !== gift.password) {
                return { success: false, error: 'Hatalı şifre' }
            }
        }

        return { success: true, gift }
    } catch (error) {
        logger.error("Get gift content error", { context: "GiftActions", error })
        return { success: false, error: 'Bir hata oluştu' }
    }
}
