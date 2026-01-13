import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { GiftForm } from "../../GiftForm"

export default async function EditGiftPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user) redirect("/login")

    const gift = await (prisma as any).gift.findUnique({
        where: {
            id,
            senderId: session.user.id
        }
    })

    if (!gift) notFound()

    // Get available tags (unlinked to any module)
    const availableTags = await prisma.nfcTag.findMany({
        where: {
            ownerId: session.user.id,
            gift: null,
            plant: null,
            mug: null,
            card: null,
            page: null
        },
        select: { id: true, publicCode: true }
    })

    return <GiftForm gift={gift} availableTags={availableTags} />
}
