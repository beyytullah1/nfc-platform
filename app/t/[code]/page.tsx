import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

type Props = {
    params: Promise<{ code: string }>
}

export default async function NfcRedirectPage({ params }: Props) {
    const { code } = await params
    const session = await auth()

    // Find tag
    const tag = await prisma.nfcTag.findUnique({
        where: { publicCode: code },
        include: {
            card: { select: { id: true, slug: true } },
            plant: { select: { id: true } },
            mug: { select: { id: true } },
            gift: { select: { id: true } }
        }
    })

    // Tag doesn't exist - redirect to claim page with code in URL
    if (!tag) {
        if (!session?.user) {
            redirect(`/login?callbackUrl=/claim?code=${code}`)
        }
        redirect(`/claim?code=${code}`)
    }

    // Tag exists - check if linked
    if (tag.moduleType && tag.ownerId) {
        // Linked - redirect to appropriate module
        switch (tag.moduleType) {
            case 'card':
                const cardPath = tag.card?.slug || tag.card?.id
                redirect(`/${cardPath}`)
            case 'plant':
                redirect(`/p/${tag.plant?.id}`)
            case 'mug':
                redirect(`/mug/${tag.mug?.id}`)
            case 'gift':
            case 'canvas':
                redirect(`/gift/${code}`)
            default:
                redirect(`/claim?code=${code}`)
        }
    }

    // Tag exists but not linked - redirect to claim
    if (!session?.user) {
        redirect(`/login?callbackUrl=/claim?code=${code}`)
    }
    redirect(`/claim?code=${code}`)
}
