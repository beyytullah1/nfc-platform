import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Delete/unclaim NFC tag
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { tagId } = await req.json()

        if (!tagId) {
            return NextResponse.json({ error: "Tag ID required" }, { status: 400 })
        }

        // Verify tag ownership
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId }
        })

        if (!tag || tag.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Tag not found or not owned" }, { status: 404 })
        }

        // Unlink and unclaim tag
        await prisma.nfcTag.update({
            where: { id: tagId },
            data: {
                ownerId: null,
                status: "available",
                claimedAt: null,
                moduleType: null,
                plant: { disconnect: true },
                mug: { disconnect: true },
                gift: { disconnect: true },
                page: { disconnect: true },
                card: { disconnect: true }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
