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

    if (!name) {
        return { error: "Bitki adı gerekli" }
    }

    const plant = await prisma.plant.create({
        data: {
            ownerId: session.user.id,
            name,
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
        where: { id: plantId }
    })

    if (!plant || plant.ownerId !== session.user.id) {
        return { error: "Bitki bulunamadı" }
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

    if (!plant || plant.ownerId !== session.user.id) {
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

    if (!plant || plant.ownerId !== session.user.id) {
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
