import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { code } = await req.json()

        if (!code) {
            return NextResponse.json({ error: "Kod gerekli" }, { status: 400 })
        }

        // Check if tag exists
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!tag) {
            return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 })
        }

        // Check if already claimed
        if (tag.ownerId) {
            return NextResponse.json({ error: "Bu etiket zaten sahiplenilmiş" }, { status: 400 })
        }

        // Claim the tag (without linking to any module)
        await prisma.nfcTag.update({
            where: { id: tag.id },
            data: {
                ownerId: session.user.id,
                status: "claimed",
                claimedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Claim-only error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
