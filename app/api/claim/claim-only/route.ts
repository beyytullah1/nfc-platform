export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        console.log('=== CLAIM-ONLY DEBUG ===')
        console.log('Session user ID:', session?.user?.id)

        if (!session?.user?.id) {
            console.log('ERROR: No session')
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        console.log('Request body:', body)

        const { code } = body
        console.log('Code from body:', code)

        if (!code) {
            console.log('ERROR: No code provided')
            return NextResponse.json({ error: "Kod gerekli" }, { status: 400 })
        }

        console.log('Searching for tag with publicCode:', code)

        // Check if tag exists
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        console.log('Tag found:', tag ? 'YES' : 'NO')
        if (tag) {
            console.log('Tag details:', { id: tag.id, ownerId: tag.ownerId, status: tag.status })
        }

        if (!tag) {
            console.log('ERROR: Tag not found')
            return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 })
        }

        // Check if already claimed by someone else
        if (tag.ownerId && tag.ownerId !== session.user.id) {
            console.log('ERROR: Tag owned by different user:', tag.ownerId)
            return NextResponse.json({ error: "Bu etiket başka birine ait" }, { status: 400 })
        }

        // If already owned by current user, just return success
        if (tag.ownerId === session.user.id) {
            console.log('Tag already owned by current user - returning success')
            return NextResponse.json({ success: true })
        }

        // Claim the tag (without linking to any module)
        console.log('Claiming tag for user:', session.user.id)
        await prisma.nfcTag.update({
            where: { id: tag.id },
            data: {
                ownerId: session.user.id,
                status: "claimed",
                claimedAt: new Date()
            }
        })

        console.log('SUCCESS: Tag claimed')
        console.log('======================')
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Claim-only error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
