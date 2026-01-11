import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MugDetailClient from "./MugDetailClient"

export default async function MugDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const mug = await prisma.mug.findUnique({
        where: { id },
        include: {
            logs: { orderBy: { createdAt: 'desc' }, take: 50 },
            tag: { select: { id: true, publicCode: true } }
        }
    })

    if (!mug) {
        redirect("/dashboard/mugs")
    }

    // Check if user is owner
    const isOwner = mug.ownerId === session.user.id
    if (!isOwner) {
        redirect("/dashboard/mugs")
    }

    // Unlinked tags for linking
    const availableTags = await prisma.nfcTag.findMany({
        where: {
            ownerId: session.user.id,
            plant: null,
            mug: null
        },
        select: { id: true, publicCode: true }
    })

    return (
        <MugDetailClient
            mug={mug}
            isOwner={isOwner}
            availableTags={availableTags}
        />
    )
}
