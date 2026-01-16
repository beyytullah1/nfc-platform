export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        // Check if user is admin
        if (!session?.user || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { tagId } = await req.json()

        if (!tagId) {
            return NextResponse.json({ error: "Tag ID gerekli" }, { status: 400 })
        }

        // Find tag
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId }
        })

        if (!tag) {
            return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 })
        }

        // Unclaim tag (remove owner and module)
        await prisma.nfcTag.update({
            where: { id: tagId },
            data: {
                ownerId: null,
                moduleType: null,
                status: "unclaimed",
                claimedAt: null
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Unclaim tag error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
