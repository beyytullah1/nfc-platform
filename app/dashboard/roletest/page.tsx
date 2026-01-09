import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function RoleTestPage() {
    const session = await auth()

    // Database'den direkt kullanıcıyı çek
    let dbUser = null
    if (session?.user?.id) {
        dbUser = await prisma.user.findUnique({
            where: { id: session.user.id as string }
        })
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
            <h1>🔍 Role Test Sayfası</h1>
            <p style={{ color: '#888' }}>Bu sayfa middleware bypass eder, direkt session ve DB'yi gösterir</p>

            <div style={{ marginTop: '2rem', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px' }}>
                <h2>📋 Session Bilgileri:</h2>
                <pre style={{ overflow: 'auto', fontSize: '12px' }}>{JSON.stringify(session?.user, null, 2)}</pre>

                <h3 style={{ marginTop: '1.5rem', color: '#60a5fa' }}>Session'da Role Değeri:</h3>
                <pre style={{ fontSize: '16px', color: '#fbbf24' }}>{JSON.stringify((session?.user as any)?.role, null, 2) || 'undefined'}</pre>
            </div>

            <div style={{ marginTop: '2rem', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px' }}>
                <h2>💾 Database Bilgileri:</h2>
                <pre style={{ overflow: 'auto', fontSize: '12px' }}>{JSON.stringify(dbUser, null, 2)}</pre>

                <h3 style={{ marginTop: '1.5rem', color: '#60a5fa' }}>Database'de Role Değeri:</h3>
                <pre style={{ fontSize: '16px', color: '#fbbf24' }}>{JSON.stringify((dbUser as any)?.role, null, 2) || 'undefined'}</pre>
            </div>

            <div style={{ marginTop: '2rem', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px' }}>
                <h2>✅ Sonuç Analizi:</h2>
                <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '18px' }}>
                        <strong>Session'da role:</strong>{' '}
                        {(session?.user as any)?.role === 'admin' ? (
                            <span style={{ color: '#4ade80' }}>✅ 'admin' (DOĞRU)</span>
                        ) : (session?.user as any)?.role === 'user' ? (
                            <span style={{ color: '#f87171' }}>❌ 'user' (Yanlış)</span>
                        ) : (
                            <span style={{ color: '#f87171' }}>❌ undefined (Hiç yok)</span>
                        )}
                    </p>

                    <p style={{ fontSize: '18px', marginTop: '1rem' }}>
                        <strong>Database'de role:</strong>{' '}
                        {(dbUser as any)?.role === 'admin' ? (
                            <span style={{ color: '#4ade80' }}>✅ 'admin' (DOĞRU)</span>
                        ) : (dbUser as any)?.role === 'user' ? (
                            <span style={{ color: '#f87171' }}>❌ 'user' (Yanlış)</span>
                        ) : (
                            <span style={{ color: '#f87171' }}>❌ undefined (Hiç yok)</span>
                        )}
                    </p>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3>🔧 Teşhis:</h3>
                    {!(dbUser as any)?.role ? (
                        <p style={{ color: '#f87171' }}>❌ Database'de role alanı yok! Migration çalışmamış.</p>
                    ) : (dbUser as any)?.role !== 'admin' ? (
                        <p style={{ color: '#f87171' }}>❌ Database'de role var ama 'admin' değil!</p>
                    ) : !(session?.user as any)?.role ? (
                        <p style={{ color: '#f87171' }}>❌ Session'da role alanı yok! Auth callback sorunu veya Prisma Client eski.</p>
                    ) : (
                        <p style={{ color: '#4ade80' }}>✅ Her şey tamam! Admin paneline erişebilmelisin.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
