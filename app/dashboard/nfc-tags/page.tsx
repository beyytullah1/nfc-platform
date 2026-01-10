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

    // Fetch pending transfer requests (sent and received)
    const sentRequests = await prisma.transferRequest.findMany({
        where: {
            fromUserId: session.user.id,
            status: 'pending'
        },
        include: {
            toUser: { select: { name: true, username: true, email: true } },
            tag: { select: { publicCode: true, moduleType: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    const receivedRequests = await prisma.transferRequest.findMany({
        where: {
            toUserId: session.user.id,
            status: 'pending'
        },
        include: {
            fromUser: { select: { name: true, username: true, email: true } },
            tag: { select: { publicCode: true, moduleType: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return <NfcTagsClient sentRequests={sentRequests} receivedRequests={receivedRequests} />
}
