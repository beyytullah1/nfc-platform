'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

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

    // Generate random public code for the digital tag
    const publicCode = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8)

    try {
        // Transaction: Create Tag -> Create Gift
        await prisma.$transaction(async (tx) => {
            // 1. Create Digital Tag
            const tag = await tx.nfcTag.create({
                data: {
                    tagId: `virtual_${Date.now()}_${publicCode}`, // Virtual physical ID
                    publicCode: publicCode,
                    moduleType: "gift",
                    ownerId: session.user!.id
                }
            })

            // 2. Create Gift linked to Tag
            await tx.gift.create({
                data: {
                    senderId: session.user!.id,
                    tagId: tag.id,
                    title,
                    message,
                    giftType,
                    mediaUrl: mediaUrl || null,
                    spotifyUrl: spotifyUrl || null,
                    senderName: senderName || null,
                    password: password || null,
                }
            })
        })

        revalidatePath("/dashboard/gifts")
        return { success: true }
    } catch (error) {
        logger.error("Create gift error", { context: "GiftActions", error })
        throw new Error("Failed to create gift")
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
                password: password || null,
            }
        })

        revalidatePath("/dashboard/gifts")
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
        // First get the gift to find the tagId
        const gift = await prisma.gift.findUnique({
            where: { id, senderId: session.user!.id }
        })

        if (!gift) throw new Error("Gift not found")

        // Transaction: Delete Gift -> Delete Tag
        await prisma.$transaction(async (tx) => {
            await tx.gift.delete({
                where: { id }
            })

            if (gift.tagId) {
                await tx.nfcTag.delete({
                    where: { id: gift.tagId }
                })
            }
        })

        revalidatePath("/dashboard/gifts")
        return { success: true }
    } catch (error) {
        logger.error("Delete gift error", { context: "GiftActions", error })
        throw new Error("Failed to delete gift")
    }
}

export async function getGiftContent(publicCode: string, password?: string) {
    try {
        const tag = await prisma.nfcTag.findFirst({
            where: { publicCode },
            include: {
                gift: true
            }
        })

        if (!tag || !tag.gift) {
            return { success: false, error: "Hediye bulunamadı" }
        }

        const gift = tag.gift

        // Check password if gift is protected
        if (gift.password && gift.password !== password) {
            return { success: false, error: "Hatalı şifre" }
        }

        return { success: true, gift }
    } catch (error) {
        logger.error("Get gift content error", { context: "GiftActions", error })
        return { success: false, error: "Bir hata oluştu" }
    }
}
