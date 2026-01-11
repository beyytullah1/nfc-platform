import { checkTag } from '@/app/actions'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import PublicCardClient from '@/app/card/[id]/PublicCardClient'

// Statik sayfaları bu route'tan hariç tut
export const dynamicParams = true

export default async function NfcGatewayPage({
    params,
}: {
    params: Promise<{ code: string }>
}) {
    const { code } = await params

    // Bilinen route'ları hariç tut (bu sayfa sadece NFC kodları için)
    const reservedPaths = [
        'login', 'register', 'dashboard', 'admin', 'api',
        'claim', 'gift', 'card', 'plant', 'mug', 'page',
        'c', 'p', 'm', 'x', 't', 'u', 'favicon.ico', '_next',
        'complete-profile', 'forgot-password', 'reset-password'
    ]

    if (reservedPaths.includes(code.toLowerCase())) {
        // Aslında bu duruma düşmemeli, Next.js statik route'lara öncelik verir
        redirect('/404')
    }

    // ÖNCE: Kartvizit slug kontrolü (localhost:3000/saglik gibi)
    const cardBySlug = await prisma.card.findFirst({
        where: { slug: code },
        include: {
            user: true,
            fields: { orderBy: { displayOrder: 'asc' } }
        }
    })

    if (cardBySlug) {
        // Kartvizit bulundu - direkt göster (yönlendirme YOK)
        const cardData = {
            id: cardBySlug.id,
            userId: cardBySlug.userId,
            hasLevel1Password: !!cardBySlug.level1Password,
            hasLevel2Password: !!cardBySlug.level2Password,
            logoUrl: cardBySlug.logoUrl,
            avatarUrl: cardBySlug.avatarUrl,
            user: {
                name: cardBySlug.user.name,
                avatarUrl: cardBySlug.user.avatarUrl,
                email: cardBySlug.user.email
            },
            title: cardBySlug.title,
            bio: cardBySlug.bio,
            fields: cardBySlug.fields.map(f => ({
                id: f.id,
                fieldType: f.fieldType,
                label: f.label,
                value: f.value,
                privacyLevel: f.privacyLevel
            }))
        }

        return <PublicCardClient initialCard={cardData} />
    }

    // NFC tag kontrolü
    const result = await checkTag(code)

    if (result.redirect) {
        redirect(result.redirect)
    }

    // Etiket bulunamadı durumu
    return (
        <div className="container" style={{
            display: 'flex',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏷️</div>
                <h1 className="title-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Sayfa Bulunamadı
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Bu adres sistemde kayıtlı değil.
                </p>
                <a
                    href="/"
                    style={{
                        display: 'inline-block',
                        marginTop: '1.5rem',
                        color: 'var(--color-primary)',
                        textDecoration: 'none'
                    }}
                >
                    ← Ana Sayfaya Dön
                </a>
            </div>
        </div>
    )
}
