import { checkTag } from '@/app/actions'
import { redirect } from 'next/navigation'

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
        'c', 'p', 'm', 'x', 't', 'favicon.ico', '_next'
    ]

    if (reservedPaths.includes(code.toLowerCase())) {
        // Aslında bu duruma düşmemeli, Next.js statik route'lara öncelik verir
        redirect('/404')
    }

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
                    Etiket Bulunamadı
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    {result.error || 'Bu NFC etiketi sistemde kayıtlı değil.'}
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
