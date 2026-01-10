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
            tag: { select: { id: true, publicCode: true } },
            coOwners: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true
                }
            }
        }
    })

    if (!plant) {
        redirect("/dashboard/plants")
    }

    // Check if user is owner or co-owner
    const isOwner = plant.ownerId === session.user.id
    const isCoOwner = plant.coOwners.some(co => co.id === session.user.id)

    if (!isOwner && !isCoOwner) {
        redirect("/dashboard/plants")
    }

    return (
        <PlantDetailClient
            plant={plant}
            userName={session.user.name || "Kullanıcı"}
        />
    )
}
