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

    // Fetch user's NFC tags with module information
    const userTags = await prisma.nfcTag.findMany({
        where: { ownerId: session.user.id },
        include: {
            card: { select: { id: true, title: true } },
            plant: { select: { id: true, name: true } },
            mug: { select: { id: true, name: true } },
            gift: { select: { id: true, title: true } },
            page: { select: { id: true, title: true } }
        },
        orderBy: { claimedAt: 'desc' }
    })

    // Fetch user's modules (for linking)
    const userModules = {
        plants: await prisma.plant.findMany({
            where: { ownerId: session.user.id, tagId: null },
            select: { id: true, name: true }
        }),
        mugs: await prisma.mug.findMany({
            where: { ownerId: session.user.id, tagId: null },
            select: { id: true, name: true }
        }),
        cards: await prisma.card.findMany({
            where: { userId: session.user.id, tagId: null },
            select: { id: true, title: true }
        }),
        gifts: await prisma.gift.findMany({
            where: { senderId: session.user.id, tagId: null },
            select: { id: true, title: true }
        }),
        pages: await prisma.page.findMany({
            where: { ownerId: session.user.id, tagId: null },
            select: { id: true, title: true }
        })
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

    // Serialize Date fields to ISO strings for client component
    const serializedTags = userTags.map(tag => ({
        ...tag,
        createdAt: tag.createdAt.toISOString(),
        claimedAt: tag.claimedAt?.toISOString() ?? null,
    }))

    const serializedSentRequests = sentRequests.map(req => ({
        ...req,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
    }))

    const serializedReceivedRequests = receivedRequests.map(req => ({
        ...req,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
    }))

    return <NfcTagsClient
        userTags={serializedTags}
        userModules={userModules}
        sentRequests={serializedSentRequests}
        receivedRequests={serializedReceivedRequests}
    />
}
