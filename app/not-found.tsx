import Link from "next/link"

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{
                fontSize: '8rem',
                marginBottom: '1rem',
                animation: 'float 3s ease-in-out infinite'
            }}>
                🔍
            </div>

            <h1 style={{
                fontSize: '6rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
            }}>
                404
            </h1>

            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'rgba(255,255,255,0.9)'
            }}>
                Sayfa Bulunamadı
            </h2>

            <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '400px',
                marginBottom: '2rem',
                lineHeight: 1.6
            }}>
                Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: '#fff',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.3s'
                    }}
                >
                    🏠 Ana Sayfa
                </Link>

                <Link
                    href="/dashboard"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: 500,
                        textDecoration: 'none'
                    }}
                >
                    📊 Dashboard
                </Link>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
            `}</style>
        </div>
    )
}
