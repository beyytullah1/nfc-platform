export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Check if user has already added a card to their network
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        // If not logged in, return exists: false
        if (!session?.user) {
            return NextResponse.json({ exists: false })
        }

        const { searchParams } = new URL(request.url)
        const cardId = searchParams.get('cardId')

        if (!cardId) {
            return NextResponse.json({ exists: false })
        }

        // Check if connection exists
        const connection = await prisma.connection.findFirst({
            where: {
                userId: session.user.id,
                cardId: cardId
            }
        })

        return NextResponse.json({
            exists: !!connection,
            connectionId: connection?.id || null
        })
    } catch (error) {
        console.error('Check connection error:', error)
        return NextResponse.json({ exists: false, error: 'Internal error' })
    }
}
