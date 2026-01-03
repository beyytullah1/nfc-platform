import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Test için örnek tag oluşturma
export async function POST(request: NextRequest) {
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

// Tag listele
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
