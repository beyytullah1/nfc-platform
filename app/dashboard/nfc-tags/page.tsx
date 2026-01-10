import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import NfcTagsClient from './NfcTagsClient'

export const metadata = {
    title: 'NFC Etiketlerim - Temasal',
    description: 'Sahip olduğunuz NFC etiketlerini görüntüleyin ve yönetin'
}

export default async function NfcTagsPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    // Fetch pending transfers (sent and received)
    const sentGifts = await prisma.ownershipTransfer.findMany({
        where: {
            fromUserId: session.user.id,
            transferType: 'gift'
        },
        include: {
            toUser: { select: { name: true, username: true, email: true } },
            tag: { select: { publicCode: true, moduleType: true } }
        },
        orderBy: { transferredAt: 'desc' },
        take: 10
    })

    const receivedGifts = await prisma.ownershipTransfer.findMany({
        where: {
            toUserId: session.user.id,
            transferType: 'gift'
        },
        include: {
            fromUser: { select: { name: true, username: true, email: true } },
            tag: { select: { publicCode: true, moduleType: true } }
        },
        orderBy: { transferredAt: 'desc' },
        take: 10
    })

    return <NfcTagsClient sentGifts={sentGifts} receivedGifts={receivedGifts} />
}
