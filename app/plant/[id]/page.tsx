import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import PublicPlantClient from "./PublicPlantClient"

export default async function PublicPlantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const plant = await prisma.plant.findFirst({
        where: {
            OR: [
                { id: id },
                { slug: id }
            ]
        },
        include: {
            owner: { select: { name: true } },
            giftedBy: { select: { name: true } },
            tag: { select: { id: true } },
            logs: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                where: { logType: { in: ['water', 'photo'] } }
            }
        }
    })

    if (!plant) {
        notFound()
    }

    return (
        <PublicPlantClient
            plant={{
                id: plant.id,
                name: plant.name,
                species: plant.species,
                birthDate: plant.birthDate,
                coverImageUrl: plant.coverImageUrl,
                isGift: plant.isGift,
                giftMessage: plant.giftMessage,
                giftedBy: plant.giftedBy,
                owner: plant.owner,
                logs: plant.logs
            }}
            tagId={plant.tag?.id || null}
        />
    )
}
