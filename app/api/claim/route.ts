import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { ModuleType } from '@/lib/types'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, moduleType, name } = body

        if (!code || !moduleType || !name) {
            return NextResponse.json(
                { error: 'Eksik bilgi.' },
                { status: 400 }
            )
        }

        // Auth kontrolü
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.', redirect: '/login' },
                { status: 401 }
            )
        }

        // NFC tag'i bul veya oluştur
        let tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!tag) {
            // Demo için yeni tag oluştur
            tag = await prisma.nfcTag.create({
                data: {
                    tagId: `TAG_${code}`,
                    publicCode: code,
                    moduleType: moduleType,
                    ownerId: session.user.id,
                    claimedAt: new Date()
                }
            })
        } else if (tag.ownerId && tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu etiket başka bir kullanıcıya ait.' },
                { status: 400 }
            )
        } else if (!tag.ownerId) {
            // Tag'i sahiplen
            await prisma.nfcTag.update({
                where: { id: tag.id },
                data: {
                    ownerId: session.user.id,
                    moduleType: moduleType,
                    claimedAt: new Date()
                }
            })
        }

        // Modüle göre içerik oluştur
        let redirect = '/dashboard'

        switch (moduleType as ModuleType) {
            case 'card':
                const card = await prisma.card.create({
                    data: {
                        userId: session.user.id,
                        tagId: tag.id,
                        title: name,
                        theme: JSON.stringify({ color: '#3b82f6', style: 'modern' })
                    }
                })
                redirect = `/dashboard/cards/${card.id}`
                break

            case 'plant':
                const plant = await prisma.plant.create({
                    data: {
                        ownerId: session.user.id,
                        tagId: tag.id,
                        name: name,
                        theme: JSON.stringify({ style: 'nature' })
                    }
                })
                redirect = `/dashboard/plants/${plant.id}`
                break

            case 'mug':
                const mug = await prisma.mug.create({
                    data: {
                        ownerId: session.user.id,
                        tagId: tag.id,
                        name: name,
                        theme: JSON.stringify({ style: 'modern' })
                    }
                })
                redirect = `/dashboard/mugs/${mug.id}`
                break

            case 'gift':
            case 'canvas':
                const page = await prisma.page.create({
                    data: {
                        ownerId: session.user.id,
                        tagId: tag.id,
                        moduleType: moduleType,
                        title: name,
                        theme: JSON.stringify({ style: 'default' })
                    }
                })
                redirect = `/dashboard/pages/${page.id}`
                break
        }

        return NextResponse.json({ redirect })
    } catch (error) {
        console.error('Claim error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
