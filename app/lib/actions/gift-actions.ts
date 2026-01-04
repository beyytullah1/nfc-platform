'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function createGift(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const title = formData.get("title") as string
    const message = formData.get("message") as string
    const giftType = formData.get("giftType") as string
    const mediaUrl = formData.get("mediaUrl") as string
    const spotifyUrl = formData.get("spotifyUrl") as string

    // Generate random public code for the digital tag
    const publicCode = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8)

    try {
        // Transaction: Create Tag -> Create Gift
        await prisma.$transaction(async (tx: any) => {
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
            await (tx as any).gift.create({
                data: {
                    senderId: session.user!.id,
                    tagId: tag.id,
                    title,
                    message,
                    giftType,
                    mediaUrl: mediaUrl || null,
                    spotifyUrl: spotifyUrl || null,
                }
            })
        })

        revalidatePath("/dashboard/gifts")
        return { success: true }
    } catch (error) {
        console.error("Create gift error:", error)
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

    try {
        await (prisma as any).gift.update({
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
            }
        })

        revalidatePath("/dashboard/gifts")
        return { success: true }
    } catch (error) {
        console.error("Update gift error:", error)
        throw new Error("Failed to update gift")
    }
}

export async function deleteGift(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        // First get the gift to find the tagId
        const gift = await (prisma as any).gift.findUnique({
            where: { id, senderId: session.user!.id }
        })

        if (!gift) throw new Error("Gift not found")

        // Transaction: Delete Gift -> Delete Tag
        await prisma.$transaction(async (tx: any) => {
            await (tx as any).gift.delete({
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
        console.error("Delete gift error:", error)
        throw new Error("Failed to delete gift")
    }
}
