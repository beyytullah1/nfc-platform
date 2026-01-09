'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Admin kontrolü
async function requireAdmin() {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
    }
    return session
}

// Rastgele public code oluştur
function generatePublicCode(length: number = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Karışıklığı önlemek için O, I, 0, 1 hariç
    let code = ''
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// Rastgele tag ID oluştur
function generateTagId(): string {
    return 'nfc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
}

// Tek NFC etiket oluştur
export async function createNfcTag(formData: FormData) {
    const session = await requireAdmin()

    const tagId = formData.get('tagId') as string || generateTagId()
    const publicCode = formData.get('publicCode') as string || generatePublicCode()
    const moduleType = formData.get('moduleType') as string | null

    // Public code benzersiz olmalı
    const existing = await prisma.nfcTag.findUnique({
        where: { publicCode }
    })

    if (existing) {
        throw new Error('Bu public code zaten kullanılıyor')
    }

    const tag = await prisma.nfcTag.create({
        data: {
            tagId,
            publicCode,
            moduleType: moduleType || null,
            status: 'unclaimed'
        }
    })

    await prisma.adminLog.create({
        data: {
            adminId: session.user.id,
            action: 'nfc_tag_created',
            targetType: 'nfc_tag',
            targetId: tag.id,
            details: JSON.stringify({ tagId, publicCode, moduleType })
        }
    })

    revalidatePath('/admin/nfc-tags')
    redirect('/admin/nfc-tags')
}

// Toplu NFC etiket oluştur
export async function bulkCreateNfcTags(count: number) {
    const session = await requireAdmin()

    if (count < 1 || count > 1000) {
        throw new Error('1 ile 1000 arasında etiket oluşturabilirsiniz')
    }

    const tags = []
    const codes = new Set<string>()

    // Benzersiz public code'lar oluştur
    while (codes.size < count) {
        codes.add(generatePublicCode())
    }

    for (const publicCode of codes) {
        tags.push({
            tagId: generateTagId(),
            publicCode,
            status: 'unclaimed' as const,
            moduleType: null
        })
    }

    // Toplu oluştur
    const result = await prisma.nfcTag.createMany({
        data: tags
    })

    await prisma.adminLog.create({
        data: {
            adminId: session.user.id,
            action: 'nfc_tags_bulk_created',
            targetType: 'nfc_tag',
            targetId: 'bulk',
            details: JSON.stringify({ count: result.count })
        }
    })

    revalidatePath('/admin/nfc-tags')

    return { success: true, count: result.count, tags }
}

// NFC etiketi sıfırla (unclaimed yap)
export async function resetNfcTag(tagId: string) {
    const session = await requireAdmin()

    const tag = await prisma.nfcTag.update({
        where: { id: tagId },
        data: {
            status: 'unclaimed',
            moduleType: null,
            ownerId: null
        }
    })

    await prisma.adminLog.create({
        data: {
            adminId: session.user.id,
            action: 'nfc_tag_reset',
            targetType: 'nfc_tag',
            targetId: tag.id,
            details: JSON.stringify({ publicCode: tag.publicCode })
        }
    })

    revalidatePath('/admin/nfc-tags')
    revalidatePath(`/t/${tag.publicCode}`)

    return { success: true }
}

// NFC etiketi sil
export async function deleteNfcTag(tagId: string) {
    const session = await requireAdmin()

    const tag = await prisma.nfcTag.delete({
        where: { id: tagId }
    })

    await prisma.adminLog.create({
        data: {
            adminId: session.user.id,
            action: 'nfc_tag_deleted',
            targetType: 'nfc_tag',
            targetId: tag.id,
            details: JSON.stringify({ publicCode: tag.publicCode })
        }
    })

    revalidatePath('/admin/nfc-tags')

    return { success: true }
}
