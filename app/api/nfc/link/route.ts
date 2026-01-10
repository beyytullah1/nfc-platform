import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Link NFC tag to a module
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { tagId, moduleType, moduleId } = await req.json()

        if (!tagId || !moduleType || !moduleId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
        }

        // Verify tag ownership
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId }
        })

        if (!tag || tag.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Tag not found or not owned" }, { status: 404 })
        }

        // Update tag based on module type
        const updateData: any = { moduleType }

        if (moduleType === 'plant') {
            updateData.plant = { connect: { id: moduleId } }
        } else if (moduleType === 'mug') {
            updateData.mug = { connect: { id: moduleId } }
        } else if (moduleType === 'gift') {
            updateData.gift = { connect: { id: moduleId } }
        } else if (moduleType === 'page') {
            updateData.page = { connect: { id: moduleId } }
        } else if (moduleType === 'card') {
            updateData.card = { connect: { id: moduleId } }
        }

        await prisma.nfcTag.update({
            where: { id: tagId },
            data: updateData
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Link error:", error)
        return NextResponse.json({ error: "Failed to link" }, { status: 500 })
    }
}
