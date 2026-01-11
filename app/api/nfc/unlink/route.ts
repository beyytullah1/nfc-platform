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
        const { tagId } = body

        if (!tagId) {
            return NextResponse.json({ error: "Etiket ID gerekli" }, { status: 400 })
        }

        // 1. Check if user owns the tag
        // 1. Check if user owns the tag and include relations
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId },
            include: { plant: true, mug: true }
        })

        if (!tag || tag.ownerId !== session.user.id) {
            return NextResponse.json({ error: "NFC etiketi bulunamadı veya size ait değil" }, { status: 404 })
        }

        // 2. Perform Unlinking (Transaction)
        await prisma.$transaction(async (tx) => {
            // Update associated module if it exists
            if (tag.plant) {
                await tx.plant.update({
                    where: { id: tag.plant.id },
                    data: { tagId: null }
                })
            }
            if (tag.mug) {
                await tx.mug.update({
                    where: { id: tag.mug.id },
                    data: { tagId: null }
                })
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Unlink error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
