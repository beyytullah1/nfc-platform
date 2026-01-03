import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import PlantDetailClient from "./PlantDetailClient"

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const plant = await prisma.plant.findUnique({
        where: { id },
        include: {
            logs: { orderBy: { createdAt: 'desc' }, take: 20 },
            giftedBy: { select: { name: true } },
            tag: { select: { id: true } }
        }
    })

    if (!plant || plant.ownerId !== session.user.id) {
        redirect("/dashboard/plants")
    }

    return (
        <PlantDetailClient
            plant={plant}
            userName={session.user.name || "Kullanıcı"}
        />
    )
}
