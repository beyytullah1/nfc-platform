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
        const { tagId, moduleId, moduleType } = body

        if (!tagId || !moduleId || !moduleType) {
            return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 })
        }

        // 1. Check if user owns the tag
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId }
        })

        if (!tag || tag.ownerId !== session.user.id) {
            return NextResponse.json({ error: "NFC etiketi bulunamadı veya size ait değil" }, { status: 404 })
        }

        // 2. Check if tag is already linked
        if (tag.plantId || tag.mugId) {
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
            // Update Tag
            await tx.nfcTag.update({
                where: { id: tagId },
                data: {
                    plantId: moduleType === "plant" ? moduleId : null,
                    mugId: moduleType === "mug" ? moduleId : null
                }
            })

            // Update Module (Plant/Mug)
            if (moduleType === "plant") {
                await tx.plant.update({
                    where: { id: moduleId },
                    data: { tagId: tagId }
                })
            } else if (moduleType === "mug") {
                await tx.mug.update({
                    where: { id: moduleId },
                    data: { tagId: tagId }
                })
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Link error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
