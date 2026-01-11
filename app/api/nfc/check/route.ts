import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Check if NFC code exists in database
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.json({ exists: false, error: 'Code is required' })
        }

        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code },
            select: {
                id: true,
                ownerId: true,
                moduleType: true,
                status: true
            }
        })

        if (!tag) {
            return NextResponse.json({ exists: false })
        }

        return NextResponse.json({
            exists: true,
            hasOwner: !!tag.ownerId,
            moduleType: tag.moduleType,
            status: tag.status
        })
    } catch (error) {
        console.error('NFC check error:', error)
        return NextResponse.json({ exists: false, error: 'Internal error' })
    }
}
