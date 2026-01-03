import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import PublicMugClient from "./PublicMugClient"

export default async function PublicMugPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const mug = await prisma.mug.findUnique({
        where: { id },
        include: {
            owner: { select: { name: true } },
            tag: { select: { id: true } },
            logs: {
                orderBy: { createdAt: "desc" },
                take: 5
            }
        }
    })

    if (!mug) {
        notFound()
    }

    // İstatistikler
    const coffeeCount = await prisma.mugLog.count({ where: { mugId: id, logType: "coffee" } })
    const teaCount = await prisma.mugLog.count({ where: { mugId: id, logType: "tea" } })
    const waterCount = await prisma.mugLog.count({ where: { mugId: id, logType: "water" } })

    return (
        <PublicMugClient
            mug={{
                id: mug.id,
                name: mug.name,
                owner: mug.owner,
                logs: mug.logs
            }}
            tagId={mug.tag?.id || null}
            stats={{ coffeeCount, teaCount, waterCount }}
        />
    )
}
