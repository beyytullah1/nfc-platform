
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Lütfen giriş yapın' }, { status: 401 })
        }

        const body = await request.json()
        const { code, moduleId, moduleType } = body

        if (!code || !moduleId || !moduleType) {
            return NextResponse.json(
                { error: 'Eksik bilgi: Kod, Modül ID ve Tipi gerekli' },
                { status: 400 }
            )
        }

        // Tag'i bul
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'NFC etiketi bulunamadı' },
                { status: 404 }
            )
        }

        // Tag zaten sahiplenilmiş mi kontrol et
        if (tag.ownerId && tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu etiket başkasına ait' },
                { status: 403 }
            )
        }

        // Modülü bul ve kontrol et
        let moduleItem = null
        let redirectUrl = '/dashboard'

        switch (moduleType) {
            case 'card':
                moduleItem = await prisma.card.findUnique({ where: { id: moduleId } })
                redirectUrl = `/c/${moduleItem?.slug || moduleItem?.id}`
                break
            case 'plant':
                moduleItem = await prisma.plant.findUnique({ where: { id: moduleId } })
                redirectUrl = `/plant/${moduleItem?.slug || moduleItem?.id}`
                break
            case 'mug':
                moduleItem = await prisma.mug.findUnique({ where: { id: moduleId } })
                redirectUrl = `/mug/${moduleItem?.slug || moduleItem?.id}`
                break
            case 'gift':
                moduleItem = await prisma.gift.findUnique({ where: { id: moduleId } })
                redirectUrl = `/gift/${moduleItem?.slug || moduleItem?.id}`
                break
            case 'page':
                moduleItem = await prisma.page.findUnique({ where: { id: moduleId } })
                redirectUrl = `/p/${moduleItem?.slug || moduleItem?.id}`
                break
            default:
                return NextResponse.json({ error: 'Geçersiz modül tipi' }, { status: 400 })
        }

        if (!moduleItem) {
            return NextResponse.json({ error: 'Seçilen modül bulunamadı' }, { status: 404 })
        }

        // Sahiplik kontrolü
        // Gift için senderId, diğerleri için ownerId veya userId
        const ownerId = moduleType === 'gift' ? (moduleItem as any).senderId : (moduleItem as any).ownerId || (moduleItem as any).userId

        if (ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Bu modül size ait değil' }, { status: 403 })
        }

        // Modül zaten başka bir tag'e bağlı mı?
        if (moduleItem.tagId && moduleItem.tagId !== tag.id) {
            return NextResponse.json({ error: 'Bu modül zaten başka bir NFC etiketine bağlı' }, { status: 400 })
        }

        // Eşleştirme işlemi (Transaction)
        await prisma.$transaction(async (tx) => {
            // 1. Tag güncelle
            await tx.nfcTag.update({
                where: { id: tag.id },
                data: {
                    ownerId: session.user!.id,
                    moduleType: moduleType,
                    status: 'linked',
                    claimedAt: tag.claimedAt || new Date()
                }
            })

            // 2. Modül güncelle (Dinamik tablo seçimi)
            const updateData = { tagId: tag.id }
            if (moduleType === 'card') await tx.card.update({ where: { id: moduleId }, data: updateData })
            else if (moduleType === 'plant') await tx.plant.update({ where: { id: moduleId }, data: updateData })
            else if (moduleType === 'mug') await tx.mug.update({ where: { id: moduleId }, data: updateData })
            else if (moduleType === 'gift') await tx.gift.update({ where: { id: moduleId }, data: updateData })
            else if (moduleType === 'page') await tx.page.update({ where: { id: moduleId }, data: updateData })
        })

        return NextResponse.json({
            success: true,
            redirect: redirectUrl
        })

    } catch (error) {
        console.error('Link module error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
