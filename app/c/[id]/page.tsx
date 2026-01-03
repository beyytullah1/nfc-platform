import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import PublicCardClient from "@/app/card/[id]/PublicCardClient"

type Props = {
    params: Promise<{ id: string }>
}

// Dynamic metadata for social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params

    // Önce slug ile ara, sonra id ile
    const card = await prisma.card.findFirst({
        where: {
            OR: [
                { slug: id },
                { id: id }
            ]
        },
        include: { user: true }
    })

    if (!card) {
        return {
            title: "Kart Bulunamadı",
            description: "Bu dijital kartvizit bulunamadı."
        }
    }

    const name = card.user.name || "Dijital Kartvizit"
    const title = card.title ? `${name} - ${card.title}` : name
    const description = card.bio || `${name} ile iletişime geçin`
    const imageUrl = card.avatarUrl || card.user.avatarUrl

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            images: imageUrl ? [{ url: imageUrl, width: 400, height: 400 }] : [],
        },
        twitter: {
            card: "summary",
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
        },
    }
}

export default async function SlugCardPage({ params }: Props) {
    const { id } = await params

    // Önce slug ile ara, sonra id ile
    const card = await prisma.card.findFirst({
        where: {
            OR: [
                { slug: id },
                { id: id }
            ]
        },
        include: {
            user: true,
            fields: { orderBy: { displayOrder: "asc" } }
        }
    })

    if (!card) {
        notFound()
    }

    const cardData = {
        id: card.id,
        userId: card.userId,
        hasLevel1Password: !!card.level1Password,
        hasLevel2Password: !!card.level2Password,
        logoUrl: card.logoUrl,
        avatarUrl: card.avatarUrl,
        user: {
            name: card.user.name,
            avatarUrl: card.user.avatarUrl,
            email: card.user.email
        },
        title: card.title,
        bio: card.bio,
        fields: card.fields.map(f => ({
            id: f.id,
            fieldType: f.fieldType,
            label: f.label,
            value: f.value,
            privacyLevel: f.privacyLevel
        }))
    }

    return <PublicCardClient initialCard={cardData} />
}
