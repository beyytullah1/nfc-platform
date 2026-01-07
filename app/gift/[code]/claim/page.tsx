import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import ClaimFormatSelector from '@/app/gift/components/ClaimFormatSelector'

type Props = {
    params: Promise<{ code: string }>
}

export default async function GiftClaimPage({ params }: Props) {
    const { code } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/login?callbackUrl=/gift/${code}/claim`)
    }

    // Find gift by public code
    const tag = await prisma.nfcTag.findFirst({
        where: { publicCode: code },
        include: {
            gift: true
        }
    })

    if (!tag || !tag.gift) {
        notFound()
    }

    const gift = tag.gift

    // Already claimed?
    if (gift.isClaimed) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: '2rem'
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎁</div>
                    <h1 style={{ color: '#fff', marginBottom: '1rem' }}>
                        Bu Hediye Zaten Sahiplenildi
                    </h1>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                        Bu hediye daha önce sahiplenilmiş.
                    </p>
                    <a
                        href="/dashboard"
                        style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            borderRadius: '0.75rem',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Dashboard'a Dön
                    </a>
                </div>
            </div>
        )
    }

    // Show format selector
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem 0'
        }}>
            <ClaimFormatSelector
                giftId={gift.id}
                giftTitle={gift.title}
            />
        </div>
    )
}
