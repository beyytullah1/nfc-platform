import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { GiftReveal } from "../components/GiftReveal"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
    const { code } = await params
    const tag = await (prisma as any).nfcTag.findUnique({
        where: { publicCode: code },
        include: { gift: { include: { sender: true } } }
    })

    if (!tag?.gift) return { title: 'Hediye Bulunamadı' }

    return {
        title: tag.gift.title || 'Sana Bir Hediye Var! 🎁',
        description: `${tag.gift.sender?.name || 'Biri'} sana özel bir dijital hediye gönderdi.`,
    }
}

export default async function PublicGiftPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params
    const tag = await (prisma as any).nfcTag.findUnique({
        where: { publicCode: code },
        include: {
            gift: {
                include: {
                    sender: true
                }
            }
        }
    })

    if (!tag || !tag.gift) {
        return notFound()
    }

    return (
        <GiftReveal gift={tag.gift} />
    )
}
