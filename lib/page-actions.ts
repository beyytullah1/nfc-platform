"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPage(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const title = formData.get("title") as string

    if (!title) {
        return { error: "Sayfa başlığı gerekli" }
    }

    const page = await prisma.page.create({
        data: {
            ownerId: session.user!.id,
            moduleType: "canvas",
            title,
            theme: JSON.stringify({ style: "default" })
        }
    })

    revalidatePath("/dashboard/pages")
    redirect(`/dashboard/pages/${page.id}`)
}

export async function addBlock(pageId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const page = await prisma.page.findUnique({
        where: { id: pageId },
        include: { blocks: true }
    })

    if (!page || page.ownerId !== session.user!.id) {
        return { error: "Sayfa bulunamadı" }
    }

    const blockType = formData.get("blockType") as string
    const content = formData.get("content") as string

    let contentJson = {}
    switch (blockType) {
        case "text":
            contentJson = { text: content }
            break
        case "image":
            contentJson = { url: content }
            break
        case "link":
            const linkText = formData.get("linkText") as string
            contentJson = { url: content, text: linkText || content }
            break
        case "video":
            contentJson = { url: content }
            break
        default:
            contentJson = { text: content }
    }

    await prisma.pageBlock.create({
        data: {
            pageId,
            blockType,
            content: JSON.stringify(contentJson),
            displayOrder: page.blocks.length
        }
    })

    revalidatePath(`/dashboard/pages/${pageId}`)
    return { success: true }
}

export async function updateBlock(blockId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const block = await prisma.pageBlock.findUnique({
        where: { id: blockId },
        include: { page: true }
    })

    if (!block || block.page.ownerId !== session.user!.id) {
        return { error: "Blok bulunamadı" }
    }

    const content = formData.get("content") as string
    const linkText = formData.get("linkText") as string

    let contentJson = {}
    switch (block.blockType) {
        case "text":
            contentJson = { text: content }
            break
        case "image":
            contentJson = { url: content }
            break
        case "link":
            contentJson = { url: content, text: linkText || content }
            break
        default:
            contentJson = { text: content }
    }

    await prisma.pageBlock.update({
        where: { id: blockId },
        data: { content: JSON.stringify(contentJson) }
    })

    revalidatePath(`/dashboard/pages/${block.pageId}`)
    return { success: true }
}

export async function deleteBlock(blockId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const block = await prisma.pageBlock.findUnique({
        where: { id: blockId },
        include: { page: true }
    })

    if (!block || block.page.ownerId !== session.user!.id) {
        return { error: "Blok bulunamadı" }
    }

    await prisma.pageBlock.delete({
        where: { id: blockId }
    })

    revalidatePath(`/dashboard/pages/${block.pageId}`)
    return { success: true }
}

export async function deletePage(pageId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const page = await prisma.page.findUnique({
        where: { id: pageId }
    })

    if (!page || page.ownerId !== session.user!.id) {
        return { error: "Sayfa bulunamadı" }
    }

    await prisma.page.delete({
        where: { id: pageId }
    })

    revalidatePath("/dashboard/pages")
    redirect("/dashboard/pages")
}

export async function updatePage(pageId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Giriş yapmalısınız" }
    }

    const page = await prisma.page.findUnique({
        where: { id: pageId }
    })

    if (!page || page.ownerId !== session.user!.id) {
        return { error: "Sayfa bulunamadı" }
    }

    const title = formData.get("title") as string
    if (title) {
        await prisma.page.update({
            where: { id: pageId },
            data: { title }
        })
    }

    revalidatePath(`/dashboard/pages/${pageId}`)
    return { success: true }
}
