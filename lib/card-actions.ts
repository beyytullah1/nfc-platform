"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCard(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const title = formData.get("title") as string
    const bio = formData.get("bio") as string
    const slug = formData.get("slug") as string
    const logoUrl = formData.get("logoUrl") as string
    const avatarUrl = formData.get("avatarUrl") as string
    const cardType = formData.get("cardType") as string || "personal"

    // Support both old flat structure and new groupsData (though create usually uses flat for now, let's keep it robust)
    const groupsJson = formData.get("groups") as string // Old legacy
    const groupsDataJson = formData.get("groupsData") as string // New structure
    const fieldsJson = formData.get("fields") as string // Old legacy

    // ... (create logic similar to update ideally, but for now focus on basics)
    // If we want new card creation to support groups, we need to update NewCardClient too.
    // For now keeping createCard simple/legacy compatible or minimal.
    // User complaint was about EDIT screen.

    // Creating minimal card
    const card = await prisma.card.create({
        data: {
            userId: session.user!.id,
            slug: slug || null,
            logoUrl: logoUrl || null,
            avatarUrl: avatarUrl || null,
            cardType,
            title,
            bio,
            isPublic: true,
            theme: JSON.stringify({ color: "#3b82f6", style: "modern" }),
        }
    })

    // If we have fields (legacy), create them
    if (fieldsJson) {
        const fields = JSON.parse(fieldsJson)
        // ... simple creation
        await prisma.cardField.createMany({
            data: fields.map((f: any, i: number) => ({
                cardId: card.id,
                fieldType: f.type,
                value: f.value,
                label: f.label,
                privacyLevel: f.privacyLevel || 0,
                displayOrder: i
            }))
        })
    }

    revalidatePath("/dashboard/cards")
    redirect(`/dashboard/cards/${card.id}`)
}

export async function updateCard(cardId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const card = await prisma.card.findUnique({
        where: { id: cardId }
    })

    if (!card || card.userId !== session.user!.id) {
        return { error: "Kartvizit bulunamadı" }
    }

    const title = formData.get("title") as string
    const bio = formData.get("bio") as string
    const slug = formData.get("slug") as string
    const logoUrl = formData.get("logoUrl") as string
    const avatarUrl = formData.get("avatarUrl") as string
    const groupsDataJson = formData.get("groupsData") as string

    interface FieldData { type: string; value: string; label?: string; privacyLevel: number }
    interface GroupData { name: string; fields: FieldData[] }
    interface Payload { groups: GroupData[]; ungroupedFields: FieldData[] }

    let payload: Payload = { groups: [], ungroupedFields: [] }

    try {
        if (groupsDataJson) {
            payload = JSON.parse(groupsDataJson)
        } else {
            // Fallback to legacy 'fields' param if groupsData missing
            const fieldsJson = formData.get("fields") as string
            if (fieldsJson) {
                payload.ungroupedFields = JSON.parse(fieldsJson)
            }
        }
    } catch (e) {
        console.error("Parse error", e)
    }

    // Transaction to replace fields and groups
    await prisma.$transaction(async (tx) => {
        // 1. Delete existing
        await tx.cardField.deleteMany({ where: { cardId } })
        await tx.cardLinkGroup.deleteMany({ where: { cardId } })

        // 2. Update Card Basic Info
        await tx.card.update({
            where: { id: cardId },
            data: {
                title,
                bio,
                slug: slug || null,
                logoUrl: logoUrl || null,
                avatarUrl: avatarUrl || null,
            }
        })

        // 3. Create Groups and their fields
        // Global display order counter
        // Actually fields displayOrder should probably be per-group or global?
        // UI renders groups in order, and fields within group.
        // Let's use 0-indexed per group.

        for (let i = 0; i < payload.groups.length; i++) {
            const groupData = payload.groups[i]
            const group = await tx.cardLinkGroup.create({
                data: {
                    cardId,
                    name: groupData.name,
                    displayOrder: i
                }
            })

            if (groupData.fields && groupData.fields.length > 0) {
                await tx.cardField.createMany({
                    data: groupData.fields.map((f, idx) => ({
                        cardId,
                        groupId: group.id,
                        fieldType: f.type,
                        value: f.value,
                        label: f.label,
                        privacyLevel: f.privacyLevel || 0,
                        displayOrder: idx
                    }))
                })
            }
        }

        // 4. Create Ungrouped Fields
        if (payload.ungroupedFields && payload.ungroupedFields.length > 0) {
            await tx.cardField.createMany({
                data: payload.ungroupedFields.map((f, idx) => ({
                    cardId,
                    groupId: null,
                    fieldType: f.type,
                    value: f.value,
                    label: f.label,
                    privacyLevel: f.privacyLevel || 0,
                    displayOrder: idx + (payload.groups.length * 100) // Put them at end logically if mixed? 
                    // DisplayOrder is usually used for sorting ALL fields if query doesn't respect groups.
                    // But our query sorts fields by displayOrder.
                    // If we render by groups, ungrouped usually go last or first.
                }))
            })
        }
    })

    revalidatePath("/dashboard/cards")
    revalidatePath(`/dashboard/cards/${cardId}`)
    // redirect(`/dashboard/cards/${cardId}`) // Don't redirect? UI might want to stay or show success. Client component has back link.
    // Usually redirect is good.
    redirect(`/dashboard/cards/${cardId}`)
}

export async function deleteCard(cardId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const card = await prisma.card.findUnique({
        where: { id: cardId }
    })

    if (!card || card.userId !== session.user!.id) {
        return { error: "Kartvizit bulunamadı" }
    }

    await prisma.card.delete({
        where: { id: cardId }
    })

    revalidatePath("/dashboard/cards")
    redirect("/dashboard/cards")
}
