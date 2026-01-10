import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import ClaimPageContent from './ClaimPageContent'

export default async function ClaimPage() {
    const session = await auth()

    // If not logged in, redirect to login with callback
    if (!session?.user) {
        // Get the code from URL (will be available in ClaimPageContent via searchParams)
        redirect('/login')
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px'
            }}>
                <Suspense fallback={<div>Yükleniyor...</div>}>
                    <ClaimPageContent />
                </Suspense>
            </div>
        </div>
    )
}
