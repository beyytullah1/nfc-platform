import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function AdminTestPage() {
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
            <h1>🔍 Admin Erişim Test Sayfası</h1>

            <div style={{ marginTop: '2rem', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px' }}>
                <h2>Session Bilgileri:</h2>
                <pre>{JSON.stringify(session?.user, null, 2)}</pre>

                <h3 style={{ marginTop: '1.5rem' }}>Session'da Role:</h3>
                <pre>{JSON.stringify((session?.user as any)?.role, null, 2)}</pre>
            </div>

            <div style={{ marginTop: '2rem', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px' }}>
                <h2>Database Bilgileri:</h2>
                <pre>{JSON.stringify(dbUser, null, 2)}</pre>

                <h3 style={{ marginTop: '1.5rem' }}>Database'de Role:</h3>
                <pre>{JSON.stringify((dbUser as any)?.role, null, 2)}</pre>
            </div>

            <div style={{ marginTop: '2rem', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px' }}>
                <h2>Sonuç:</h2>
                {(session?.user as any)?.role === 'admin' ? (
                    <p style={{ color: '#4ade80' }}>✅ Session'da admin role VAR</p>
                ) : (
                    <p style={{ color: '#f87171' }}>❌ Session'da admin role YOK</p>
                )}

                {(dbUser as any)?.role === 'admin' ? (
                    <p style={{ color: '#4ade80' }}>✅ Database'de admin role VAR</p>
                ) : (
                    <p style={{ color: '#f87171' }}>❌ Database'de admin role YOK</p>
                )}
            </div>
        </div>
    )
}
