"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPlant(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const name = formData.get("name") as string
    const species = formData.get("species") as string
    const birthDate = formData.get("birthDate") as string
    let slug = formData.get("slug") as string

    if (!name) {
        return { error: "Bitki adı gerekli" }
    }

    // Auto-generate slug if not provided
    if (!slug) {
        slug = name
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    // Check if slug is unique
    const existing = await prisma.plant.findUnique({ where: { slug } })
    if (existing) {
        slug = `${slug}-${Date.now()}`
    }

    const plant = await prisma.plant.create({
        data: {
            ownerId: session.user!.id,
            name,
            slug,
            species: species || null,
            birthDate: birthDate ? new Date(birthDate) : null,
            theme: JSON.stringify({ style: "nature" })
        }
    })

    revalidatePath("/dashboard/plants")
    redirect(`/dashboard/plants/${plant.id}`)
}

export async function addPlantLog(plantId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const plant = await prisma.plant.findUnique({
        where: { id: plantId },
        include: { coOwners: true }
    })

    // Check if user is owner OR co-owner
    const isOwner = plant?.ownerId === session.user!.id
    const isCoOwner = plant?.coOwners.some(co => co.id === session.user!.id)

    if (!plant || (!isOwner && !isCoOwner)) {
        return { error: "Bu bitkiye log ekleme yetkiniz yok" }
    }

    const logType = formData.get("logType") as string
    const content = formData.get("content") as string
    const amountMl = formData.get("amountMl") as string

    await prisma.plantLog.create({
        data: {
            plantId,
            logType,
            content: content || null,
            amountMl: amountMl ? parseInt(amountMl) : null
        }
    })

    // If watering, send notifications to followers
    if (logType === 'water' && plant.tagId) {
        // 1. Find followers
        const follows = await prisma.follow.findMany({
            where: { tagId: plant.tagId },
            include: { user: true }
        })

        // 2. Create notifications
        if (follows.length > 0) {
            const notifications = follows
                .filter(f => f.userId !== session.user!.id) // Don't notify self
                .map(f => ({
                    userId: f.userId,
                    senderId: session.user!.id,
                    type: 'plant_reminder', // Reuse existing type or add 'plant_update'
                    title: `🌿 ${plant.name} sulandı!`,
                    body: `${session.user!.name} tarafından sulama yapıldı.`,
                    data: `/p/${plant.id}`
                }))

            if (notifications.length > 0) {
                await prisma.notification.createMany({
                    data: notifications
                })
            }
        }
    }

    revalidatePath(`/dashboard/plants/${plantId}`)
    return { success: true }
}

export async function deletePlant(plantId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const plant = await prisma.plant.findUnique({
        where: { id: plantId }
    })

    if (!plant || plant.ownerId !== session.user!.id) {
        return { error: "Bitki bulunamadı" }
    }

    await prisma.plant.delete({
        where: { id: plantId }
    })

    revalidatePath("/dashboard/plants")
    redirect("/dashboard/plants")
}

export async function updatePlant(plantId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const plant = await prisma.plant.findUnique({
        where: { id: plantId }
    })

    if (!plant || plant.ownerId !== session.user!.id) {
        return { error: "Bitki bulunamadı" }
    }

    const name = formData.get("name") as string
    const species = formData.get("species") as string

    await prisma.plant.update({
        where: { id: plantId },
        data: {
            name,
            species: species || null
        }
    })

    revalidatePath(`/dashboard/plants/${plantId}`)
    return { success: true }
}

export async function updatePlantPrivacy(plantId: string, privacyLevel: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Giriş yapmalısınız" }
    }

    const plant = await prisma.plant.findUnique({
        where: { id: plantId }
    })

    if (!plant || plant.ownerId !== session.user!.id) {
        return { success: false, error: "Bitki bulunamadı veya yetkiniz yok" }
    }

    await prisma.plant.update({
        where: { id: plantId },
        data: { privacyLevel }
    })

    revalidatePath(`/dashboard/plants/${plantId}`)
    return { success: true }
}

export async function addPlantCoOwner(plantId: string, username: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Giriş yapmalısınız" }
    }

    const plant = await prisma.plant.findUnique({
        where: { id: plantId },
        include: { coOwners: true }
    })

    if (!plant || plant.ownerId !== session.user!.id) {
        return { success: false, error: "Bitki bulunamadı veya yetkiniz yok" }
    }

    // Find user by username
    const userToAdd = await prisma.user.findUnique({
        where: { username: username.toLowerCase() }
    })

    if (!userToAdd) {
        return { success: false, error: "Kullanıcı bulunamadı" }
    }

    // Check if already owner or co-owner
    if (userToAdd.id === plant.ownerId) {
        return { success: false, error: "Bu kullanıcı zaten bitkinin sahibi" }
    }

    if (plant.coOwners.some(co => co.id === userToAdd.id)) {
        return { success: false, error: "Bu kullanıcı zaten ortak kullanıcı" }
    }

    // Add co-owner
    await prisma.plant.update({
        where: { id: plantId },
        data: {
            coOwners: {
                connect: { id: userToAdd.id }
            }
        }
    })

    // Create notification
    await prisma.notification.create({
        data: {
            userId: userToAdd.id,
            senderId: session.user.id,
            type: 'plant_coowner',
            title: 'Yeni Bitki Ortaklığı 🌱',
            body: `${session.user.name || 'Birisi'} sizi bir bitkiye ortak olarak ekledi.`
        }
    })

    revalidatePath(`/dashboard/plants/${plantId}`)
    return { success: true, user: { id: userToAdd.id, name: userToAdd.name, username: userToAdd.username } }
}

export async function removePlantCoOwner(plantId: string, userId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Giriş yapmalısınız" }
    }

    const plant = await prisma.plant.findUnique({
        where: { id: plantId }
    })

    if (!plant || plant.ownerId !== session.user!.id) {
        return { success: false, error: "Bitki bulunamadı veya yetkiniz yok" }
    }

    await prisma.plant.update({
        where: { id: plantId },
        data: {
            coOwners: {
                disconnect: { id: userId }
            }
        }
    })

    revalidatePath(`/dashboard/plants/${plantId}`)
    return { success: true }
}
