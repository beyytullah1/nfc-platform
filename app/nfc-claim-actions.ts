'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

/**
 * Register sonrası bekleyen NFC'yi claim et
 */
export async function claimPendingNFC() {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: 'Unauthorized' }
    }

    // Cookie'den pending NFC kodunu al
    const cookieStore = await cookies()
    const pendingCode = cookieStore.get('pending_nfc_code')

    if (!pendingCode?.value) {
        return { success: false, message: 'No pending NFC' }
    }

    try {
        // Tag'i bul
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: pendingCode.value }
        })

        if (!tag) {
            const cookieStore = await cookies()
            cookieStore.delete('pending_nfc_code')
            return { error: 'Tag bulunamadı' }
        }

        // Tag zaten başkasına ait mi?
        if (tag.ownerId && tag.ownerId !== session.user.id) {
            const cookieStore = await cookies()
            cookieStore.delete('pending_nfc_code')
            return { error: 'Bu tag başkasına ait' }
        }

        // Tag'i claim et
        await prisma.nfcTag.update({
            where: { id: tag.id },
            data: {
                ownerId: session.user.id,
                claimedAt: new Date(),
                status: 'claimed'
            }
        })

        // Cookie'yi temizle
        const cookieStore = await cookies()
        cookieStore.delete('pending_nfc_code')

        return {
            success: true,
            message: 'NFC başarıyla sahiplenildi',
            code: pendingCode.value
        }

    } catch (error) {
        console.error('Claim pending NFC error:', error)
        return { error: 'Bir hata oluştu' }
    }
}

/**
 * Pending NFC code'u kontrol et
 */
export async function checkPendingNFC() {
    const cookieStore = await cookies()
    const pendingCode = cookieStore.get('pending_nfc_code')
    return {
        hasPending: !!pendingCode?.value,
        code: pendingCode?.value || null
    }
}
