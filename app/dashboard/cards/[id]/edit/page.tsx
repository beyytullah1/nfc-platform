import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import EditCardClient from "./EditCardClient"

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const card = await prisma.card.findUnique({
        where: { id },
        include: {
            fields: { orderBy: { displayOrder: 'asc' } },
            groups: { orderBy: { displayOrder: 'asc' } }
        }
    })

    if (!card || card.userId !== session.user.id) {
        redirect("/dashboard/cards")
    }

    return (
        <EditCardClient
            card={card}
            userName={session.user.name || "Kullanıcı"}
        />
    )
}
