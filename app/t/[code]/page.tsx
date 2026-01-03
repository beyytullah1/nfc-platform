import { checkTag } from '@/app/actions'
import { redirect } from 'next/navigation'

export default async function NfcRedirectPage({
    params,
}: {
    params: Promise<{ code: string }>
}) {
    const { code } = await params
    const result = await checkTag(code)

    if (result.redirect) {
        redirect(result.redirect)
    }

    // Hata durumu
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
            </div>
        </div>
    )
}
