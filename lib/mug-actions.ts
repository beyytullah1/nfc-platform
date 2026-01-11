"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createMug(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const name = formData.get("name") as string
    let slug = formData.get("slug") as string

    if (!name) {
        return { error: "Kupa adı gerekli" }
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
    const existing = await prisma.mug.findUnique({ where: { slug } })
    if (existing) {
        slug = `${slug}-${Date.now()}`
    }

    const mug = await prisma.mug.create({
        data: {
            ownerId: session.user!.id,
            name,
            slug,
            theme: JSON.stringify({ style: "warm" })
        }
    })

    revalidatePath("/dashboard/mugs")
    redirect(`/dashboard/mugs/${mug.id}`)
}

export async function addMugLog(mugId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Giriş yapmalısınız")
    }

    try {
        const mug = await prisma.mug.findUnique({
            where: { id: mugId }
        })

        if (!mug || mug.ownerId !== session.user!.id) {
            throw new Error("Kupa bulunamadı")
        }

        const logType = formData.get("logType") as string
        const note = formData.get("note") as string

        await prisma.mugLog.create({
            data: {
                mugId,
                logType,
                note
            }
        })

        revalidatePath(`/dashboard/mugs/${mugId}`)
        return { success: true }
    } catch (error) {
        console.error("Add log error:", error)
        throw new Error("İçecek eklenemedi")
    }
}

export async function deleteMug(mugId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const mug = await prisma.mug.findUnique({
        where: { id: mugId }
    })

    if (!mug || mug.ownerId !== session.user!.id) {
        return { error: "Kupa bulunamadı" }
    }

    await prisma.mug.delete({
        where: { id: mugId }
    })

    revalidatePath("/dashboard/mugs")
    redirect("/dashboard/mugs")
}

export async function updateMug(mugId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const mug = await prisma.mug.findUnique({
        where: { id: mugId }
    })

    if (!mug || mug.ownerId !== session.user!.id) {
        return { error: "Kupa bulunamadı" }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string

    // Check slug uniqueness if changed
    if (slug && slug !== mug.slug) {
        const existing = await prisma.mug.findFirst({
            where: { slug, id: { not: mugId } }
        })
        if (existing) {
            return { error: "Bu kullanıcı adı zaten kullanılıyor" }
        }
    }

    await prisma.mug.update({
        where: { id: mugId },
        data: {
            name,
            ...(slug && { slug })
        }
    })

    revalidatePath(`/dashboard/mugs/${mugId}`)
    redirect(`/dashboard/mugs/${mugId}`)
}
