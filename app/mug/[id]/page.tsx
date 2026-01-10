import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import PublicMugClient from "./PublicMugClient"

type Props = {
    params: Promise<{ id: string }>
}

// Dynamic metadata for browser title
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params

    const mug = await prisma.mug.findFirst({
        where: {
            OR: [
                { id: id },
                { slug: id }
            ]
        },
        select: { name: true, owner: { select: { name: true } } }
    })

    if (!mug) {
        return {
            title: "Kupa Bulunamadı",
            description: "Bu akıllı kupa bulunamadı."
        }
    }

    const title = `${mug.name} - Akıllı Kupa`
    const description = `${mug.owner.name || 'Kullanıcı'}'nın akıllı kupası: ${mug.name}`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
        },
        twitter: {
            card: "summary",
            title,
            description,
        },
    }
}

export default async function PublicMugPage({ params }: Props) {
    const { id } = await params

    const mug = await prisma.mug.findFirst({
        where: {
            OR: [
                { id: id },
                { slug: id }
            ]
        },
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

    // İstatistikler - parallel queries
    const [coffeeCount, teaCount, waterCount] = await Promise.all([
        prisma.mugLog.count({ where: { mugId: id, logType: "coffee" } }),
        prisma.mugLog.count({ where: { mugId: id, logType: "tea" } }),
        prisma.mugLog.count({ where: { mugId: id, logType: "water" } })
    ])

    // Follow Logic
    let isFollowing = false
    let followerCount = 0

    if (mug.tag) {
        const session = await auth()

        // Parallel queries for follow status and count
        const [followCount, userFollow] = await Promise.all([
            prisma.follow.count({
                where: { tagId: mug.tag.id }
            }),
            session?.user?.id ? prisma.follow.findUnique({
                where: {
                    userId_tagId: {
                        userId: session.user.id,
                        tagId: mug.tag.id
                    }
                }
            }) : null
        ])

        followerCount = followCount
        isFollowing = !!userFollow
    }

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
            initialIsFollowing={isFollowing}
            followerCount={followerCount}
        />
    )
}
