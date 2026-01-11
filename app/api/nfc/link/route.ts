import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Oturum açmalısınız" }, { status: 401 })
        }

        const body = await req.json()
        const { tagId, publicCode, moduleId, moduleType } = body

        if ((!tagId && !publicCode) || !moduleId || !moduleType) {
            return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 })
        }

        // 1. Find the tag (either by ID or Code) and include relations
        let tag;
        if (tagId) {
            tag = await prisma.nfcTag.findUnique({ where: { id: tagId }, include: { plant: true, mug: true } })
        } else if (publicCode) {
            tag = await prisma.nfcTag.findUnique({ where: { publicCode: publicCode }, include: { plant: true, mug: true } })
        }

        if (!tag || tag.ownerId !== session.user.id) {
            return NextResponse.json({ error: "NFC etiketi bulunamadı veya size ait değil" }, { status: 404 })
        }

        // Use the found tag ID for linking
        const finalTagId = tag.id;

        // 2. Check if tag is already linked
        if (tag.plant || tag.mug) {
            return NextResponse.json({ error: "Bu etiket zaten başka bir şeye bağlı" }, { status: 400 })
        }

        // 3. Check if user owns the module (plant/mug)
        if (moduleType === "plant") {
            const plant = await prisma.plant.findUnique({
                where: { id: moduleId }
            })
            if (!plant || plant.ownerId !== session.user.id) {
                return NextResponse.json({ error: "Bitki bulunamadı veya size ait değil" }, { status: 404 })
            }
            // Check if plant already has a tag
            if (plant.tagId) {
                return NextResponse.json({ error: "Bu bitkinin zaten bir etiketi var" }, { status: 400 })
            }
        } else if (moduleType === "mug") {
            const mug = await prisma.mug.findUnique({
                where: { id: moduleId }
            })
            if (!mug || mug.ownerId !== session.user.id) {
                return NextResponse.json({ error: "Kupa bulunamadı veya size ait değil" }, { status: 404 })
            }
            if (mug.tagId) {
                return NextResponse.json({ error: "Bu kupanın zaten bir etiketi var" }, { status: 400 })
            }
        } else {
            return NextResponse.json({ error: "Geçersiz modül tipi" }, { status: 400 })
        }

        // 4. Perform Linking (Transaction)
        await prisma.$transaction(async (tx) => {
            // Update Module (Plant/Mug)
            if (moduleType === "plant") {
                await tx.plant.update({
                    where: { id: moduleId },
                    data: { tagId: finalTagId }
                })
            } else if (moduleType === "mug") {
                await tx.mug.update({
                    where: { id: moduleId },
                    data: { tagId: finalTagId }
                })
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Link error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
