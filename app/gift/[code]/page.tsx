import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { GiftAccessControl } from "../components/GiftAccessControl"

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
    const { code } = await params

    // Try finding by NFC tag code first, then by gift ID
    let gift = null

    const tag = await prisma.nfcTag.findUnique({
        where: { publicCode: code },
        include: { gift: { include: { sender: true } } }
    })

    if (tag?.gift) {
        gift = tag.gift
    } else {
        // Try finding directly by gift ID
        gift = await prisma.gift.findUnique({
            where: { id: code },
            include: { sender: true }
        })
    }

    if (!gift) return { title: 'Hediye Bulunamadı' }

    return {
        title: gift.title || 'Sana Bir Hediye Var! 🎁',
        description: `${gift.sender?.name || gift.senderName || 'Biri'} sana özel bir dijital hediye gönderdi.`,
    }
}

export default async function PublicGiftPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params

    let gift = null
    let tagId: string | null = null

    // Try finding by NFC tag code first
    const tag = await prisma.nfcTag.findUnique({
        where: { publicCode: code },
        include: {
            gift: {
                include: {
                    sender: true
                }
            }
        }
    })

    if (tag?.gift) {
        gift = tag.gift
        tagId = tag.id
    } else {
        // Try finding directly by gift ID
        gift = await prisma.gift.findUnique({
            where: { id: code },
            include: { sender: true, tag: true }
        })
        if (gift?.tag) {
            tagId = gift.tag.id
        }
    }

    if (!gift) {
        return notFound()
    }

    // Safe data to show
    const publicData = {
        title: gift.title,
        senderName: gift.senderName || gift.sender?.name || null,
        giftType: gift.giftType
    }

    // Check if gift is password protected
    const isLocked = !!gift.password

    return (
        <GiftAccessControl
            publicCode={code}
            giftId={gift.id}
            initialGift={isLocked ? undefined : gift}
            isLocked={isLocked}
            publicData={publicData}
            tagId={tagId || undefined}
        />
    )
}
