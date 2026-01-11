import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { GiftForm } from "../GiftForm"

export default async function NewGiftPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

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

    return <GiftForm availableTags={availableTags} />
}
