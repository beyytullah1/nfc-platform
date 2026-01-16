export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Önce slug ile ara, sonra id ile
        const card = await prisma.card.findFirst({
            where: {
                OR: [
                    { slug: id },
                    { id: id }
                ]
            }
        })

        if (!card) {
            return NextResponse.json({ error: "Kart bulunamadı" }, { status: 404 })
        }

        // View count'u artır
        await prisma.card.update({
            where: { id: card.id },
            data: { viewCount: { increment: 1 } }
        })

        return NextResponse.json({ success: true, viewCount: card.viewCount + 1 })
    } catch (error) {
        console.error("View tracking error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
