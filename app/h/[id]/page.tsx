import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { GiftAccessControl } from "@/app/gift/components/GiftAccessControl"
import { cache } from "react"

type Props = {
    params: Promise<{ id: string }>
}

// Cached database query
const getGift = cache(async (id: string) => {
    console.log('Searching for gift with identifier:', id)
    try {
        // 1. Try generic ID lookup
        let gift = await prisma.gift.findUnique({
            where: { id },
            include: {
                tag: true
            }
        })

        if (gift) {
            console.log('Found gift by ID:', gift.id)
            return gift
        }

        // 2. Try slug lookup
        gift = await prisma.gift.findUnique({
            where: { slug: id },
            include: {
                tag: true
            }
        })

        if (gift) {
            console.log('Found gift by Slug:', gift.id)
            return gift
        }

        console.log('Gift not found for identifier:', id)
        return null
    } catch (error) {
        console.error('Database error loading gift:', error)
        throw error
    }
})

// Dynamic metadata for social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const gift = await getGift(id)

    if (!gift) {
        return {
            title: "Hediye Bulunamadı",
            description: "Bu hediye bulunamadı."
        }
    }

    const title = gift.title || "Sürpriz Hediye 🎁"
    const description = "Sizin için özel bir hediye hazırlandı!"

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: gift.mediaUrl ? [{ url: gift.mediaUrl }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: gift.mediaUrl ? [gift.mediaUrl] : [],
        },
    }
}

export default async function GiftPublicPage({ params }: Props) {
    const { id } = await params
    const gift = await getGift(id)

    if (!gift) {
        notFound()
    }

    // Check if gift is password protected
    const isLocked = !!gift.password

    // Public data (always visible)
    const publicData = {
        title: gift.title,
        senderName: gift.senderName,
        giftType: gift.giftType,
        passwordHint: gift.passwordHint
    }

    return (
        <GiftAccessControl
            giftId={gift.id}
            publicCode={gift.tag?.publicCode || gift.id}
            initialGift={!isLocked ? gift : undefined}
            isLocked={isLocked}
            publicData={publicData}
            tagId={gift.tag?.id}
        />
    )
}
