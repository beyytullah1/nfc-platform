export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'

/**
 * SECURITY: NFC tags can ONLY be created via admin panel
 * This endpoint is for READ-ONLY operations
 */

// POST - DISABLED - Tags can only be created via admin panel
export async function POST(request: NextRequest) {
    // Verify admin role
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    if (user?.role !== 'admin') {
        return NextResponse.json(
            { error: 'Bu işlem sadece admin tarafından yapılabilir. NFC etiketleri admin panelinden oluşturulmalıdır.' },
            { status: 403 }
        )
    }

    // Only admins can create tags
    try {
        const body = await request.json()
        const { tagId, publicCode } = body

        if (!tagId || !publicCode) {
            return NextResponse.json(
                { error: 'tagId ve publicCode gerekli.' },
                { status: 400 }
            )
        }

        const tag = await prisma.nfcTag.create({
            data: {
                tagId,
                publicCode,
            },
        })

        return NextResponse.json({ tag })
    } catch (error) {
        console.error('Create tag error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// GET - Tag listele (read-only, safe)
export async function GET(request: NextRequest) {
    try {
        const tags = await prisma.nfcTag.findMany({
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        return NextResponse.json({ tags })
    } catch (error) {
        console.error('Get tags error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
